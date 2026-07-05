/**
 * Web implementation of the shared `TokenStorage` seam (see `@twy/core`):
 *  - access token  → in-memory only (cleared on full reload; re-obtained via refresh). Keeping it
 *    out of localStorage limits its exposure to XSS.
 *  - refresh token → localStorage, so a returning user stays signed in across reloads.
 *
 * The mobile app provides its own implementation backed by expo-secure-store.
 */
import type { TokenStorage } from "@twy/core";

const REFRESH_TOKEN_KEY = "twy.refreshToken";

let accessToken: string | null = null;

const isBrowser = () => typeof window !== "undefined";

export const tokenStorage: TokenStorage = {
  getAccessToken: (): string | null => accessToken,

  getRefreshToken: (): string | null =>
    isBrowser() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null,

  set: (access: string, refresh: string): void => {
    accessToken = access;
    if (isBrowser()) window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  setAccessToken: (access: string): void => {
    accessToken = access;
  },

  clear: (): void => {
    accessToken = null;
    if (isBrowser()) window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
