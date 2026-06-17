/**
 * Centralised, typed access to environment variables.
 *
 * Importing from here (instead of reading `process.env` ad hoc) keeps every required variable
 * documented in one place and fails fast if one is missing at build/runtime.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  /** Base URL of the Spring Boot API, e.g. http://localhost:8080 */
  apiBaseUrl: required(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ),
} as const;
