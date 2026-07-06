import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AuthResponse, LoginInput, RegisterInput, RegistrationResult, User } from "@twy/core";

// Importing from "@/lib/api" also configures the shared client (base URL + secure storage).
import { authApi, registerUnauthorizedHandler } from "@/lib/api";
import { tokenStorage } from "@/lib/token-storage";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: Status;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegistrationResult>;
  verifyEmail: (email: string, code: string) => Promise<void>;
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
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Restore the session on launch: if a refresh token exists in secure storage, the API client
  // transparently exchanges it for an access token while fetching the profile.
  useEffect(() => {
    let active = true;

    (async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        if (active) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await authApi.getMe();
        if (!active) return;
        setUser(me);
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

  const logout = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, status, login, register, verifyEmail, logout }),
    [user, status, login, register, verifyEmail, logout],
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
