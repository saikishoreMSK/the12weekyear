/**
 * Token persistence strategy:
 *  - access token  → in-memory only (cleared on full reload; re-obtained via refresh). Keeping it
 *    out of localStorage limits its exposure to XSS.
 *  - refresh token → localStorage, so a returning user stays signed in across reloads.
 *
 * The same API surface will back the native app later, swapping localStorage for secure storage.
 */
const REFRESH_TOKEN_KEY = "twy.refreshToken";

let accessToken: string | null = null;

const isBrowser = () => typeof window !== "undefined";

export const tokenStorage = {
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
