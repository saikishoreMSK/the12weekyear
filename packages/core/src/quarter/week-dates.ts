import { parseIsoDate } from "../date";

/** The (up to 7) calendar dates of a given quarter week, clamped to the quarter's end. */
export function weekDates(quarterStartIso: string, quarterEndIso: string, week: number): Date[] {
  const start = parseIsoDate(quarterStartIso);
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = parseIsoDate(quarterEndIso);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d > end) break;
    days.push(d);
  }
  return days;
}

/** e.g. "05/06 – 11/06" for a quarter week. */
export function weekRangeLabel(quarterStartIso: string, quarterEndIso: string, week: number): string {
  const days = weekDates(quarterStartIso, quarterEndIso, week);
  if (days.length === 0) return "";
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(days[0])} – ${fmt(days[days.length - 1])}`;
}
