/**
 * Typed access to Expo's public env vars. EXPO_PUBLIC_* is inlined at build time — Metro reads
 * apps/mobile/.env for local dev; EAS reads the build profile's `env` in eas.json. Falls back to the
 * production API URL so a missing var degrades gracefully instead of crashing the app on launch.
 */
const FALLBACK_API_BASE_URL = "https://twelveweekyear-api.onrender.com";

export const env = {
  /** Base URL of the Spring Boot API, e.g. https://twelveweekyear-api.onrender.com */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? FALLBACK_API_BASE_URL,
} as const;
