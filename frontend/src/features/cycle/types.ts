export type CycleStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

/** Mirrors the backend `GoalResponse`. */
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
}

/** Mirrors the backend `CycleResponse`. */
export interface Cycle {
  id: string;
  title: string;
  objective: string | null;
  status: CycleStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalWeeks: number;
  currentDay: number | null;
  currentWeek: number | null;
  goals: Goal[];
}

/** Mirrors the backend `CycleSummaryResponse`. */
export interface CycleSummary {
  id: string;
  title: string;
  status: CycleStatus;
  startDate: string;
  endDate: string;
  currentDay: number | null;
  currentWeek: number | null;
  totalDays: number;
  goalCount: number;
}

export interface CreateCycleInput {
  title: string;
  objective?: string;
  startDate: string;
}

export interface UpdateCycleInput {
  title: string;
  objective?: string;
  status: CycleStatus;
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
