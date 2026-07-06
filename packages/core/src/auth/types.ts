/** Mirrors the backend `UserResponse`. */
export interface User {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  createdAt: string;
}

/** Mirrors the backend `AuthResponse`. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
}

/** Mirrors the backend `RegistrationResponse` — no tokens until the email is verified. */
export interface RegistrationResult {
  email: string;
  verificationRequired: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type OtpPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";
