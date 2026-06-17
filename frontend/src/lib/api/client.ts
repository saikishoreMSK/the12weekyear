import { env } from "@/config/env";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { ApiResponse } from "./types";

/**
 * Thrown when the API returns a non-success envelope or the request fails at the transport level.
 * Carries the stable error code so callers can branch without parsing messages.
 */
export class ApiException extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiException";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Plain object; serialised to JSON automatically. */
  body?: unknown;
  /** Skip attaching the access token and the 401-refresh retry (used by the auth endpoints). */
  skipAuth?: boolean;
}

/** Called when a request is rejected and cannot be recovered by refreshing (e.g. expired session). */
let unauthorizedHandler: (() => void) | null = null;
export function registerUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

// Single-flight refresh: concurrent 401s share one refresh call instead of stampeding the endpoint.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const envelope = (await response.json()) as ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>;
        if (!response.ok || !envelope.success || !envelope.data) {
          tokenStorage.clear();
          return null;
        }
        tokenStorage.set(envelope.data.accessToken, envelope.data.refreshToken);
        return envelope.data.accessToken;
      } catch {
        tokenStorage.clear();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function send<T>(
  path: string,
  options: RequestOptions,
  allowRefresh: boolean,
): Promise<T> {
  const { body, headers, skipAuth, ...rest } = options;
  const accessToken = tokenStorage.getAccessToken();

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && !skipAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiException("Network request failed", "NETWORK_ERROR", 0);
  }

  // Access token likely expired — refresh once and retry the original request transparently.
  if (response.status === 401 && allowRefresh && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return send<T>(path, options, false);
    }
    unauthorizedHandler?.();
  }

  const envelope = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !envelope.success) {
    const error = envelope.error;
    throw new ApiException(
      error?.message ?? "Request failed",
      error?.code ?? "UNKNOWN",
      response.status,
    );
  }

  return envelope.data as T;
}

function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return send<T>(path, options, true);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
