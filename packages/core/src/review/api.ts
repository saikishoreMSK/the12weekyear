import { apiClient } from "../api/client";
import { guestBackend } from "../local-backend";
import type { WeeklyReview, WeeklyReviewInput } from "./types";

export const reviewApi = {
  list: (quarterId: string) => {
    const g = guestBackend();
    return g ? g.listReviews(quarterId) : apiClient.get<WeeklyReview[]>(`/api/v1/quarters/${quarterId}/reviews`);
  },

  /** Create or update the review for a week. */
  save: (quarterId: string, weekNumber: number, input: WeeklyReviewInput) => {
    const g = guestBackend();
    return g
      ? g.saveReview(quarterId, weekNumber, input)
      : apiClient.put<WeeklyReview>(`/api/v1/quarters/${quarterId}/reviews/${weekNumber}`, input);
  },
};
