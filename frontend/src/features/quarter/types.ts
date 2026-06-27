export type QuarterState = "UPCOMING" | "ACTIVE" | "COMPLETED";
export type GoalPace = "AHEAD" | "ON_TRACK" | "BEHIND";

export interface Goal {
  id: string;
  category: string;
  title: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  progressPercent: number;
  weekStart: number;
  weekEnd: number;
  pace: GoalPace | null;
}

export interface QuarterHabit {
  id: string;
  name: string;
  currentStreak: number;
  completedToday: boolean;
  completionRate: number;
}

/** Mirrors the backend `QuarterResponse` (execution view). */
export interface Quarter {
  id: string;
  year: number;
  quarterNumber: number;
  label: string; // e.g. "Jan – Mar"
  title: string | null;
  objective: string | null;
  state: QuarterState;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalWeeks: number;
  currentDay: number | null;
  currentWeek: number | null;
  sprintScore: number;
  goalsProgress: number;
  habitsConsistency: number;
  goals: Goal[];
  habits: QuarterHabit[];
}

/** Mirrors the backend `QuarterTile`. */
export interface QuarterTile {
  quarterNumber: number;
  label: string;
  state: QuarterState;
  planned: boolean;
  quarterId: string | null;
  title: string | null;
  score: number | null;
  currentDay: number | null;
  totalDays: number;
  goalCount: number;
}

export interface YearDashboard {
  year: number;
  quarters: QuarterTile[];
}

export interface CreateQuarterInput {
  year: number;
  quarterNumber: number;
  title?: string;
  objective?: string;
}

export interface UpdateQuarterInput {
  title?: string;
  objective?: string;
}

export interface CreateGoalInput {
  category: string;
  title: string;
  unit: string;
  targetValue: number;
  weekStart?: number;
  weekEnd?: number;
}

export interface UpdateGoalInput {
  category?: string;
  title?: string;
  unit?: string;
  targetValue?: number;
  currentValue?: number;
  weekStart?: number;
  weekEnd?: number;
}

export interface GoalOutcome {
  category: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
  met: boolean;
}

export interface HabitHighlight {
  name: string;
  completionRate: number;
  longestStreak: number;
}

/** Mirrors the backend `QuarterReportResponse`. */
export interface QuarterReport {
  id: string;
  year: number;
  quarterNumber: number;
  label: string;
  title: string | null;
  objective: string | null;
  sprintScore: number;
  goalsProgress: number;
  habitsConsistency: number;
  goals: GoalOutcome[];
  habits: HabitHighlight[];
  reviewsCompleted: number;
  totalWeeks: number;
}
