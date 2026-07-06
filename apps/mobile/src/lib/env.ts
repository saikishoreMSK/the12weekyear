/**
 * Typed access to Expo's public env vars. Expo inlines EXPO_PUBLIC_* at build time
 * (from apps/mobile/.env). Reading them here keeps the required set documented in one place.
 */
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_BASE_URL — set it in apps/mobile/.env (see .env.example).",
  );
}

export const env = {
  /** Base URL of the Spring Boot API, e.g. https://twelveweekyear-api.onrender.com */
  apiBaseUrl,
} as const;
