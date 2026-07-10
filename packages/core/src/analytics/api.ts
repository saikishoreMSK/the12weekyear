import { apiClient } from "../api/client";
import { guestBackend } from "../local-backend";
import type { Analytics } from "./types";

export const analyticsApi = {
  get: () => {
    const g = guestBackend();
    return g ? g.analytics() : apiClient.get<Analytics>("/api/v1/analytics");
  },
};
