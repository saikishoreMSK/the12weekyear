/**
 * Token persistence seam — the one place web and mobile differ in how tokens are stored.
 *
 * Strategy (same on both platforms):
 *  - access token  → in-memory only (limits XSS/leak exposure; re-obtained via refresh).
 *  - refresh token → persistent storage, so a returning user stays signed in across restarts.
 *
 * The persistent side differs per platform, so each app injects its own implementation via
 * `configureApiClient`:
 *  - @twy/web    → localStorage (synchronous).
 *  - @twy/mobile → expo-secure-store / Android Keystore (asynchronous).
 *
 * Read/write of the *refresh* token may therefore be async; the client awaits them uniformly, so a
 * synchronous implementation (returning plain values) is equally valid. The access token is always
 * held in memory, so `getAccessToken`/`setAccessToken` stay synchronous on both platforms.
 */
export interface TokenStorage {
  /** In-memory access token (synchronous on every platform). */
  getAccessToken(): string | null;
  /** Persisted refresh token; may be async (e.g. SecureStore). */
  getRefreshToken(): string | null | Promise<string | null>;
  /** Persist both tokens (access in memory, refresh in storage). */
  set(access: string, refresh: string): void | Promise<void>;
  /** Update only the in-memory access token. */
  setAccessToken(access: string): void;
  /** Clear the access token and remove the persisted refresh token. */
  clear(): void | Promise<void>;
}
