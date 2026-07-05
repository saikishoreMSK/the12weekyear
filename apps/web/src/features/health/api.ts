import { apiClient } from "@/lib/api/client";
import type { HealthResponse } from "./types";

/** Pings the backend's versioned liveness endpoint. */
export function getHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>("/api/v1/health");
}
