/**
 * @twy/core — shared code between the web app (@twy/web) and the React Native app (@twy/mobile).
 *
 * Today: the API envelope types, the platform-agnostic API client, and the token-storage seam.
 * Later (as the mobile app consumes them): feature DTO types, TanStack Query hooks, zod schemas,
 * and the calculators ported from the backend (QuarterMath / Streaks / SprintScore / analytics).
 */
export * from "./api/types";
export * from "./api/storage";
export * from "./api/client";
export * from "./auth/types";
export * from "./auth/api";
export * from "./auth/schemas";
export * from "./quarter/types";
export * from "./quarter/api";
export * from "./quarter/queries";
export * from "./quote/quotes";
export * from "./quote/quote-of-the-day";
