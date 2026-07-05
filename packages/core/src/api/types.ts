/**
 * TypeScript mirror of the backend's response envelope (see `common/api/ApiResponse.java`).
 *
 * Keeping these shapes in sync with the backend is the contract that lets the same client code
 * be reused by both the web app (@twy/web) and the React Native app (@twy/mobile).
 */

export interface FieldViolation {
  field: string;
  message: string;
}

export interface ApiError {
  /** Stable machine-readable code (matches the backend `ErrorCode` enum name). */
  code: string;
  message: string;
  details?: FieldViolation[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  timestamp: string;
}
