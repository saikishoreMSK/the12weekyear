import { apiClient } from "@/lib/api/client";
import type { Dashboard } from "./types";

export const dashboardApi = {
  /** Throws ApiException with status 404 when the user has no active cycle. */
  get: () => apiClient.get<Dashboard>("/api/v1/dashboard"),
};
