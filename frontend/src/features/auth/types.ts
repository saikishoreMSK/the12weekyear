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

export interface LoginInput {
  email: string;
  password: string;
}
