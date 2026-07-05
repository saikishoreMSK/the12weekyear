import { apiClient } from "@/lib/api/client";
import type { Analytics } from "./types";

export const analyticsApi = {
  get: () => apiClient.get<Analytics>("/api/v1/analytics"),
};
