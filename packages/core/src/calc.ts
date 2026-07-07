import { parseIsoDate, toIsoDate } from "./date";
import type { Goal, Quarter, QuarterHabit } from "./quarter/types";
import type { Habit } from "./habit/types";

/**
 * Client-side ports of the backend's pure calculators (Streaks / HabitStats / SprintScore and the
 * quarter score derivation in QuarterService). Used to recompute derived values optimistically so
 * streaks, completion %, and the quarter score update in real time on a toggle — before the server
 * round-trip. ISO yyyy-MM-dd strings compare lexicographically = chronologically, which we rely on.
 */

/** Mean as an integer percent; 0 for an empty list (mirrors SprintScore.average). */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function addDaysIso(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

function daysInclusive(startIso: string, endIso: string): number {
  const ms = parseIsoDate(endIso).getTime() - parseIsoDate(startIso).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/** Consecutive active days ending today (if active) or yesterday. Mirrors Streaks.current. */
export function currentStreak(todayIso: string, dates: Set<string>): number {
  let streak = 0;
  let cursor = dates.has(todayIso) ? todayIso : addDaysIso(todayIso, -1);
  while (dates.has(cursor)) {
    streak++;
    cursor = addDaysIso(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive active days. Mirrors Streaks.longest. */
export function longestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0;
  const sorted = [...dates].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === addDaysIso(sorted[i - 1], 1) ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return longest;
}

/** Completed days in [startIso, endIso] as a percent of elapsed days, capped 0–100. */
export function rateInWindow(dates: Set<string>, startIso: string, endIso: string): number {
  const days = daysInclusive(startIso, endIso);
  if (days <= 0) return 0;
  let done = 0;
  dates.forEach((d) => {
    if (d >= startIso && d <= endIso) done++;
  });
  return Math.min(100, Math.max(0, Math.round((done * 100) / days)));
}

export interface HabitStatFields {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  completedToday: boolean;
}

/** Per-habit stats from raw completion dates. Mirrors HabitStats.compute. */
export function habitStats(startDateIso: string, todayIso: string, completionDates: string[]): HabitStatFields {
  const dates = new Set(completionDates);
  return {
    currentStreak: currentStreak(todayIso, dates),
    longestStreak: longestStreak(dates),
    completionRate: rateInWindow(dates, startDateIso, todayIso),
    totalCompletions: dates.size,
    completedToday: dates.has(todayIso),
  };
}

/** Average goal progress: null if there are no goals, else % of goals done. */
export function averageGoalProgress(goals: Goal[]): number | null {
  if (goals.length === 0) return null;
  return average(goals.map((g) => (g.done ? 100 : 0)));
}

/** Equal-weighted mean of the present (non-null) dimensions. Mirrors SprintScore.combine. */
export function combineScore(goalsProgress: number | null, habitsConsistency: number | null): number {
  const present = [goalsProgress, habitsConsistency].filter((v): v is number => v !== null);
  return average(present);
}

/** Recompute a habit's derived stats after its completionDates change (optimistic). */
export function recomputeHabit(habit: Habit, todayIso: string): Habit {
  return { ...habit, ...habitStats(habit.startDate, todayIso, habit.completionDates) };
}

/**
 * Recompute a quarter's derived fields (goalsProgress, per-habit stats, habitsConsistency, score).
 * Pass `habitsById` to rebuild the habit rows from raw completions (habit toggle); pass null to keep
 * the existing habit rates (goal toggle — habits unchanged).
 */
export function recomputeQuarterDerived(
  quarter: Quarter,
  habitsById: Map<string, Habit> | null,
  todayIso: string,
): Quarter {
  const goalsProgress = averageGoalProgress(quarter.goals);
  const started = todayIso >= quarter.startDate;
  const windowEnd = todayIso <= quarter.endDate ? todayIso : quarter.endDate;

  let habits: QuarterHabit[] = quarter.habits;
  if (habitsById) {
    habits = quarter.habits.map((qh) => {
      const h = habitsById.get(qh.id);
      if (!h) return qh;
      const comps = new Set(h.completionDates);
      const effStart = quarter.startDate > h.startDate ? quarter.startDate : h.startDate;
      return {
        ...qh,
        currentStreak: currentStreak(todayIso, comps),
        completedToday: comps.has(todayIso),
        completionRate: started ? rateInWindow(comps, effStart, windowEnd) : 0,
      };
    });
  }

  const habitsConsistency =
    habits.length > 0 && started ? average(habits.map((h) => h.completionRate)) : null;

  return {
    ...quarter,
    habits,
    goalsProgress: goalsProgress ?? 0,
    habitsConsistency: habitsConsistency ?? 0,
    sprintScore: combineScore(goalsProgress, habitsConsistency),
  };
}
