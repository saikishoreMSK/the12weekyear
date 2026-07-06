import * as SecureStore from "expo-secure-store";

import type { TokenStorage } from "@twy/core";

/**
 * Secure token storage for the mobile app (implements the @twy/core TokenStorage seam):
 *  - access token  → in-memory only (re-obtained via refresh on cold start).
 *  - refresh token → expo-secure-store (Android Keystore / iOS Keychain), read back asynchronously.
 *
 * The async reads/writes are why the seam allows Promise-returning methods.
 */
const REFRESH_TOKEN_KEY = "twy.refreshToken";

let accessToken: string | null = null;

export const tokenStorage: TokenStorage = {
  getAccessToken: () => accessToken,

  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  set: async (access, refresh) => {
    accessToken = access;
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
  },

  setAccessToken: (access) => {
    accessToken = access;
  },

  clear: async () => {
    accessToken = null;
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
