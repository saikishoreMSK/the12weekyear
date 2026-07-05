/** Mirrors the backend `HabitResponse`. */
export interface Habit {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  startDate: string;
  active: boolean;
  completedToday: boolean;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  /** Completed dates (ISO yyyy-MM-dd) within the recent window. */
  completionDates: string[];
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  color?: string;
  active?: boolean;
}
