/**
 * Web entry point for the shared API client.
 *
 * The real implementation lives in `@twy/core`; here we inject the web-specific configuration
 * (base URL from Next's env, refresh-token persistence via localStorage) exactly once, then
 * re-export the client surface so existing imports (`@/lib/api/client`) keep working unchanged.
 */
import { configureApiClient } from "@twy/core";

import { env } from "@/config/env";
import { tokenStorage } from "@/lib/auth/token-storage";

configureApiClient({ baseUrl: env.apiBaseUrl, storage: tokenStorage });

export * from "@twy/core";
