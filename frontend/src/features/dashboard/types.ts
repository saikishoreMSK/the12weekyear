import type { CycleStatus, Goal } from "@/features/cycle/types";

export interface DashboardHabit {
  id: string;
  name: string;
  currentStreak: number;
  completedToday: boolean;
  sprintCompletionRate: number;
}

/** Mirrors the backend `DashboardResponse`. */
export interface Dashboard {
  cycleId: string;
  cycleTitle: string;
  status: CycleStatus;
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
  habits: DashboardHabit[];
}
