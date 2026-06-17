"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { registerUnauthorizedHandler } from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/token-storage";
import { authApi } from "./api";
import type { LoginInput, RegisterInput, User } from "./types";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: Status;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Best-effort detection of the browser's IANA timezone, used as the registration default. */
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
    tokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Restore the session on first load: if a refresh token exists, the API client transparently
  // exchanges it for an access token while fetching the profile.
  useEffect(() => {
    let active = true;

    if (!tokenStorage.getRefreshToken()) {
      setStatus("unauthenticated");
      return;
    }

    authApi
      .getMe()
      .then((me) => {
        if (!active) return;
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => active && clearSession());

    return () => {
      active = false;
    };
  }, [clearSession]);

  // When a request fails irrecoverably with 401, drop the session globally.
  useEffect(() => {
    registerUnauthorizedHandler(() => clearSession());
    return () => registerUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async (input: LoginInput) => {
    const auth = await authApi.login(input);
    tokenStorage.set(auth.accessToken, auth.refreshToken);
    setUser(auth.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const auth = await authApi.register({
      ...input,
      timezone: input.timezone ?? detectTimezone(),
    });
    tokenStorage.set(auth.accessToken, auth.refreshToken);
    setUser(auth.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
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
