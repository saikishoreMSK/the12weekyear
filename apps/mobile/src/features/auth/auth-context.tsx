import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  isNetworkError,
  queueWrite,
  setGuestMode,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type RegistrationResult,
  type User,
} from "@twy/core";

// Importing from "@/lib/api" also configures the shared client (base URL + secure storage).
import { authApi, registerUnauthorizedHandler } from "@/lib/api";
import { tokenStorage } from "@/lib/token-storage";
import { clearUser, loadUser, saveUser } from "@/features/auth/user-store";
import { hasPendingProfile } from "@/lib/outbox";
import { resetAdoption } from "@/features/sync/adopt";

// "guest" = using the app locally with no account (local-first). "authenticated" = signed in (cloud).
type Status = "loading" | "authenticated" | "guest";

interface AuthContextValue {
  user: User | null;
  status: Status;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegistrationResult>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Best-effort detection of the device's IANA timezone, used as the registration default. */
function detectTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const clearSession = useCallback(() => {
    void tokenStorage.clear();
    void clearUser();
    setUser(null);
    resetAdoption(); // allow a future sign-in to adopt local data again
    setGuestMode(true); // fall back to local-first guest mode (keeps local data)
    setStatus("guest");
  }, []);

  // Restore the session on launch WITHOUT blocking on the network: if we have a refresh token and a
  // cached user, go straight to "authenticated" and validate /users/me in the background. This keeps
  // the app instant + usable offline (the free-tier backend can take ~60s to wake). A 401 is handled
  // by the unauthorized handler; a network failure just keeps the cached session.
  useEffect(() => {
    let active = true;

    (async () => {
      const [refreshToken, cachedUser] = await Promise.all([tokenStorage.getRefreshToken(), loadUser()]);
      if (!refreshToken) {
        if (active) {
          setGuestMode(true);
          setStatus("guest");
        }
        return;
      }
      if (cachedUser) {
        if (!active) return;
        setGuestMode(false);
        setUser(cachedUser);
        setStatus("authenticated");
        // Refresh the profile in the background; ignore failures (offline / cold backend).
        authApi
          .getMe()
          .then((me) => {
            if (!active) return;
            // Don't let the server's (stale) name overwrite a display-name edit still queued offline.
            const next = hasPendingProfile() ? { ...me, displayName: cachedUser.displayName } : me;
            setUser(next);
            void saveUser(next);
          })
          .catch(() => {});
        return;
      }
      // No cached user (e.g. first run after upgrade) — fall back to fetching before showing the app.
      try {
        const me = await authApi.getMe();
        if (!active) return;
        setGuestMode(false);
        setUser(me);
        void saveUser(me);
        setStatus("authenticated");
      } catch {
        if (active) clearSession();
      }
    })();

    return () => {
      active = false;
    };
  }, [clearSession]);

  // When a request fails irrecoverably with 401, drop the session globally.
  useEffect(() => {
    registerUnauthorizedHandler(() => clearSession());
    return () => registerUnauthorizedHandler(null);
  }, [clearSession]);

  const applySession = useCallback(async (auth: AuthResponse) => {
    await tokenStorage.set(auth.accessToken, auth.refreshToken);
    void saveUser(auth.user);
    setGuestMode(false);
    setUser(auth.user);
    setStatus("authenticated");
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      await applySession(await authApi.login(input));
    },
    [applySession],
  );

  // Registration no longer logs you in — it creates an unverified account and emails an OTP.
  const register = useCallback(
    (input: RegisterInput): Promise<RegistrationResult> =>
      authApi.register({ ...input, timezone: input.timezone ?? detectTimezone() }),
    [],
  );

  // Successful email verification returns tokens — this is where a new user actually signs in.
  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      await applySession(await authApi.verifyEmail(email, code));
    },
    [applySession],
  );

  // Edit the display name instantly + offline: update the cached user right away (in memory + on
  // disk so it shows immediately and survives a restart), then PATCH /users/me in the background —
  // queued in the offline outbox and replayed on reconnect if the device is offline.
  const updateDisplayName = useCallback(
    async (raw: string) => {
      const name = raw.trim();
      if (!name || !user || user.displayName === name) return;
      const optimistic = { ...user, displayName: name };
      setUser(optimistic);
      void saveUser(optimistic);
      try {
        const server = await authApi.updateMe({ displayName: name });
        setUser(server);
        void saveUser(server);
      } catch (e) {
        if (isNetworkError(e)) queueWrite({ kind: "profile", displayName: name });
        // else: keep the optimistic value; it reconciles on the next getMe
      }
    },
    [user],
  );

  const logout = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, status, login, register, verifyEmail, updateDisplayName, logout }),
    [user, status, login, register, verifyEmail, updateDisplayName, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
