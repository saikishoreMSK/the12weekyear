import { apiClient } from "@/lib/api/client";
import type { WeeklyReview, WeeklyReviewInput } from "./types";

export const reviewApi = {
  list: (cycleId: string) =>
    apiClient.get<WeeklyReview[]>(`/api/v1/cycles/${cycleId}/reviews`),

  /** Create or update the review for a week. */
  save: (cycleId: string, weekNumber: number, input: WeeklyReviewInput) =>
    apiClient.put<WeeklyReview>(`/api/v1/cycles/${cycleId}/reviews/${weekNumber}`, input),
};
