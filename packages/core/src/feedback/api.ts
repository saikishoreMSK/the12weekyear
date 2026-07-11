import { apiClient } from "../api/client";

export interface FeedbackInput {
  message: string;
  rating?: number; // optional 1–5
}

export interface FeedbackResult {
  id: string;
  message: string;
  rating: number | null;
  createdAt: string;
}

/**
 * Feedback always goes to the SERVER (never the local guest backend) so it reaches the admin panel.
 * The endpoint is public: a signed-in user is attributed via their token; a guest submits anonymously.
 */
export const feedbackApi = {
  submit: (input: FeedbackInput) => apiClient.post<FeedbackResult>("/api/v1/feedback", input),
};
