import { currentStreak, longestStreak } from "../calc";
import { parseIsoDate, toIsoDate } from "../date";
import type { Analytics } from "./types";

/**
 * Client-side port of the backend AnalyticsCalculator. Sums completions across ALL habits per day
 * (a day with 2 habits done counts 2), then derives all-time streaks/totals plus a windowed weekday
 * breakdown + heatmap. Lets guest mode show the same analytics the server would.
 */

const WINDOW_DAYS = 365;
const WEEKDAY_NAMES = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
// JS Date.getDay(): 0=Sun … 6=Sat → weekday name
const JS_DAY_NAME = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/** @param allCompletionDates one array of ISO dates per habit (active + archived, like the server). */
export function computeAnalytics(todayIso: string, allCompletionDates: string[][]): Analytics {
  const counts = new Map<string, number>();
  for (const dates of allCompletionDates) {
    for (const d of dates) counts.set(d, (counts.get(d) ?? 0) + 1);
  }

  const activeDaySet = new Set(counts.keys());
  let totalCompletions = 0;
  counts.forEach((c) => (totalCompletions += c));

  const start = parseIsoDate(todayIso);
  start.setDate(start.getDate() - (WINDOW_DAYS - 1));
  const windowStartIso = toIsoDate(start);

  const byWeekday = new Map<string, number>(WEEKDAY_NAMES.map((n) => [n, 0]));
  const heatmap: { date: string; count: number }[] = [];
  counts.forEach((count, date) => {
    if (date >= windowStartIso && date <= todayIso) {
      const name = JS_DAY_NAME[parseIsoDate(date).getDay()];
      byWeekday.set(name, (byWeekday.get(name) ?? 0) + count);
      heatmap.push({ date, count });
    }
  });
  heatmap.sort((a, b) => a.date.localeCompare(b.date));

  const weekdayCounts = WEEKDAY_NAMES.map((n) => ({ dayOfWeek: n, count: byWeekday.get(n) ?? 0 }));

  let bestDayOfWeek: string | null = null;
  let worstDayOfWeek: string | null = null;
  if (WEEKDAY_NAMES.some((n) => (byWeekday.get(n) ?? 0) > 0)) {
    let best = "MONDAY";
    let worst = "MONDAY";
    for (const n of WEEKDAY_NAMES) {
      const c = byWeekday.get(n) ?? 0;
      if (c > (byWeekday.get(best) ?? 0)) best = n;
      if (c < (byWeekday.get(worst) ?? 0)) worst = n;
    }
    bestDayOfWeek = best;
    worstDayOfWeek = worst;
  }

  return {
    currentStreak: currentStreak(todayIso, activeDaySet),
    longestStreak: longestStreak(activeDaySet),
    totalCompletions,
    activeDays: activeDaySet.size,
    bestDayOfWeek,
    worstDayOfWeek,
    weekdayCounts,
    windowStart: windowStartIso,
    windowEnd: todayIso,
    heatmap,
  };
}
