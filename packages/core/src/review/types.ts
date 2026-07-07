/** Mirrors the backend `WeeklyReviewResponse`. */
export interface WeeklyReview {
  id: string;
  weekNumber: number;
  wentWell: string | null;
  wastedTime: string | null;
  biggestWin: string | null;
  biggestBlocker: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReviewInput {
  wentWell?: string;
  wastedTime?: string;
  biggestWin?: string;
  biggestBlocker?: string;
}
