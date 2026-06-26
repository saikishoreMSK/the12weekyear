import { apiClient } from "@/lib/api/client";
import type {
  AuthResponse,
  LoginInput,
  OtpPurpose,
  RegisterInput,
  RegistrationResult,
  User,
} from "./types";

/**
 * Auth endpoints. The unauthenticated ones pass `skipAuth` so they neither attach a (possibly
 * stale) access token nor trigger the 401-refresh retry — they're the entry/exit points.
 */
export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<RegistrationResult>("/api/v1/auth/register", input, { skipAuth: true }),

  verifyEmail: (email: string, code: string) =>
    apiClient.post<AuthResponse>("/api/v1/auth/verify-email", { email, code }, { skipAuth: true }),

  resendOtp: (email: string, purpose: OtpPurpose) =>
    apiClient.post<void>("/api/v1/auth/resend-otp", { email, purpose }, { skipAuth: true }),

  login: (input: LoginInput) =>
    apiClient.post<AuthResponse>("/api/v1/auth/login", input, { skipAuth: true }),

  forgotPassword: (email: string) =>
    apiClient.post<void>("/api/v1/auth/forgot-password", { email }, { skipAuth: true }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiClient.post<void>("/api/v1/auth/reset-password", { email, code, newPassword }, { skipAuth: true }),

  logout: (refreshToken: string) =>
    apiClient.post<void>("/api/v1/auth/logout", { refreshToken }, { skipAuth: true }),

  getMe: () => apiClient.get<User>("/api/v1/users/me"),
};
