import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import type { TokenStorage } from "@twy/core";

/**
 * Cross-platform token storage (implements the @twy/core TokenStorage seam):
 *  - access token  → in-memory only (re-obtained via refresh on cold start).
 *  - refresh token → persisted:
 *      • native (Android/iOS) → expo-secure-store (Keystore/Keychain), read back asynchronously.
 *      • web (dev preview)    → localStorage, since SecureStore has no web implementation.
 */
const REFRESH_TOKEN_KEY = "twy.refreshToken";

let accessToken: string | null = null;

interface WebStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Only defined on web; native never touches it.
const webStore: WebStore | undefined =
  Platform.OS === "web" ? (globalThis as { localStorage?: WebStore }).localStorage : undefined;

export const tokenStorage: TokenStorage = {
  getAccessToken: () => accessToken,

  getRefreshToken: () =>
    webStore ? webStore.getItem(REFRESH_TOKEN_KEY) : SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  set: async (access, refresh) => {
    accessToken = access;
    if (webStore) webStore.setItem(REFRESH_TOKEN_KEY, refresh);
    else await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
  },

  setAccessToken: (access) => {
    accessToken = access;
  },

  clear: async () => {
    accessToken = null;
    if (webStore) webStore.removeItem(REFRESH_TOKEN_KEY);
    else await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
