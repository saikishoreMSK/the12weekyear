import { apiClient } from "@/lib/api/client";
import type { WeeklyReview, WeeklyReviewInput } from "./types";

export const reviewApi = {
  list: (quarterId: string) =>
    apiClient.get<WeeklyReview[]>(`/api/v1/quarters/${quarterId}/reviews`),

  /** Create or update the review for a week. */
  save: (quarterId: string, weekNumber: number, input: WeeklyReviewInput) =>
    apiClient.put<WeeklyReview>(`/api/v1/quarters/${quarterId}/reviews/${weekNumber}`, input),
};
