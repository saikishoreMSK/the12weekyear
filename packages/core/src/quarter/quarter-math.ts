import { parseIsoDate, toIsoDate } from "../date";
import type { GoalStatus, QuarterState } from "./types";

/**
 * Client-side port of the backend's QuarterMath + QuarterMapper (calendar quarters Q1=Jan–Mar …
 * Q4=Oct–Dec). Lets local (guest) mode derive the exact same quarter bounds, pacing, label, and
 * goal status the server would — so numbers stay consistent when a guest later syncs to the cloud.
 * ISO yyyy-MM-dd strings compare lexicographically = chronologically.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A quarter is treated as at most 13 weeks; the last week absorbs the extra 1–2 days. */
export const MAX_WEEKS = 13;

export interface QuarterBounds {
  startIso: string;
  endIso: string;
  totalDays: number;
}

/** Calendar bounds of a quarter, leap-year aware. */
export function quarterBounds(year: number, quarterNumber: number): QuarterBounds {
  const startMonthIndex = (quarterNumber - 1) * 3; // 0-based month
  const start = new Date(year, startMonthIndex, 1);
  const end = new Date(year, startMonthIndex + 3, 0); // day 0 of the next month = last day of the 3rd month
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return { startIso: toIsoDate(start), endIso: toIsoDate(end), totalDays };
}

export function quarterTotalWeeks(totalDays: number): number {
  return Math.min(MAX_WEEKS, Math.ceil(totalDays / 7));
}

/** Month-range label, e.g. Q1 → "Jan – Mar". */
export function quarterLabel(quarterNumber: number): string {
  const m = (quarterNumber - 1) * 3;
  return `${MONTHS[m]} – ${MONTHS[m + 2]}`;
}

export interface QuarterProgress {
  state: QuarterState;
  currentDay: number | null;
  currentWeek: number | null;
  totalDays: number;
  totalWeeks: number;
}

export function quarterProgress(year: number, quarterNumber: number, todayIso: string): QuarterProgress {
  const b = quarterBounds(year, quarterNumber);
  const totalWeeks = quarterTotalWeeks(b.totalDays);
  if (todayIso < b.startIso) {
    return { state: "UPCOMING", currentDay: null, currentWeek: null, totalDays: b.totalDays, totalWeeks };
  }
  if (todayIso > b.endIso) {
    return { state: "COMPLETED", currentDay: null, currentWeek: null, totalDays: b.totalDays, totalWeeks };
  }
  const dayIndex = Math.round(
    (parseIsoDate(todayIso).getTime() - parseIsoDate(b.startIso).getTime()) / 86_400_000,
  ); // 0-based
  return {
    state: "ACTIVE",
    currentDay: dayIndex + 1,
    currentWeek: Math.min(MAX_WEEKS, Math.floor(dayIndex / 7) + 1),
    totalDays: b.totalDays,
    totalWeeks,
  };
}

/** Which quarter number (1–4) contains a given date. */
export function quarterNumberOf(todayIso: string): number {
  const month = parseIsoDate(todayIso).getMonth(); // 0-based
  return Math.floor(month / 3) + 1;
}

/** Goal status, mirroring the backend QuarterMapper.status. */
export function computeGoalStatus(
  done: boolean,
  state: QuarterState,
  week: number,
  currentWeek: number | null,
): GoalStatus {
  if (done) return "DONE";
  if (state === "UPCOMING") return "UPCOMING";
  if (state === "COMPLETED") return "MISSED";
  // ACTIVE
  if (currentWeek != null && week === currentWeek) return "THIS_WEEK";
  return currentWeek != null && week > currentWeek ? "UPCOMING" : "MISSED";
}
