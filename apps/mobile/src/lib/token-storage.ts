import type { TokenStorage } from "@twy/core";

/**
 * M0 placeholder token storage — in-memory only, so the connectivity check can run.
 *
 * Replaced in M1 with an expo-secure-store implementation (Android Keystore): the access token
 * stays in memory while the refresh token is persisted securely and read back asynchronously.
 * The `TokenStorage` seam already allows async reads/writes, so that swap is drop-in.
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenStorage: TokenStorage = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  set: (access, refresh) => {
    accessToken = access;
    refreshToken = refresh;
  },
  setAccessToken: (access) => {
    accessToken = access;
  },
  clear: () => {
    accessToken = null;
    refreshToken = null;
  },
};
