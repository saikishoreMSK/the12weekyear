/**
 * Mobile entry point for the shared API client.
 *
 * Injects the mobile-specific configuration (base URL from Expo env, token storage) into the
 * shared client from @twy/core, then re-exports its surface. Import this module once at app
 * startup (see src/app/_layout.tsx) so the client is configured before any request.
 */
import { configureApiClient } from "@twy/core";

import { env } from "./env";
import { tokenStorage } from "./token-storage";

configureApiClient({ baseUrl: env.apiBaseUrl, storage: tokenStorage });

export * from "@twy/core";
