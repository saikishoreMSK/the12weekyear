/** Local calendar date as yyyy-MM-dd (NOT UTC — avoids the off-by-one from toISOString). */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The last `n` calendar dates ending today, oldest first, as ISO strings. */
export function lastNDates(n: number): string[] {
  const today = new Date();
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(toIsoDate(d));
  }
  return dates;
}

/** Parse a yyyy-MM-dd string into a local Date (midnight local, no UTC shift). */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Short weekday + day-of-month label for a yyyy-MM-dd string, e.g. "Mon 16". */
export function shortDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  return `${weekday} ${d}`;
}
