import { apiClient } from "@/lib/api/client";
import type { AuthResponse, LoginInput, RegisterInput, User } from "./types";

/**
 * Auth endpoints. Register/login/logout pass `skipAuth` so they neither attach a (possibly stale)
 * access token nor trigger the 401-refresh retry — they are the entry/exit points of a session.
 */
export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<AuthResponse>("/api/v1/auth/register", input, { skipAuth: true }),

  login: (input: LoginInput) =>
    apiClient.post<AuthResponse>("/api/v1/auth/login", input, { skipAuth: true }),

  logout: (refreshToken: string) =>
    apiClient.post<void>("/api/v1/auth/logout", { refreshToken }, { skipAuth: true }),

  getMe: () => apiClient.get<User>("/api/v1/users/me"),
};
