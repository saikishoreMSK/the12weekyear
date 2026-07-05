"use client";

import { useMemo } from "react";

import type { HeatmapDay } from "@/features/analytics/types";
import { parseIsoDate, toIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface Props {
  windowStart: string;
  windowEnd: string;
  heatmap: HeatmapDay[];
}

interface Cell {
  iso: string;
  count: number | null; // null = outside the window (padding for grid alignment)
}

interface MonthGroup {
  key: string; // year-month, unique per group
  label: string; // "Jan", "Feb", …
  weeks: Cell[][];
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function intensityClass(count: number | null): string {
  if (count === null) return "bg-transparent";
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-emerald-200 dark:bg-emerald-900";
  if (count === 2) return "bg-emerald-300 dark:bg-emerald-700";
  if (count === 3) return "bg-emerald-400 dark:bg-emerald-600";
  return "bg-emerald-500";
}

/**
 * GitHub-style contribution grid: one column per week (Sun→Sat top to bottom), grouped by month
 * with a labelled header and a gap between months. A week is attributed to the month of its
 * Sunday, so month boundaries land on the nearest week.
 */
export function ContributionHeatmap({ windowStart, windowEnd, heatmap }: Props) {
  const groups = useMemo<MonthGroup[]>(() => {
    const counts = new Map(heatmap.map((d) => [d.date, d.count]));
    const start = parseIsoDate(windowStart);
    const end = parseIsoDate(windowEnd);

    // Pad the first column back to its Sunday so rows line up by weekday.
    const cursor = new Date(start);
    cursor.setDate(start.getDate() - start.getDay());

    const result: MonthGroup[] = [];
    while (cursor <= end) {
      // Build one week column (Sun..Sat). The Sunday decides the column's month.
      const anchor = new Date(cursor);
      const week: Cell[] = [];
      for (let i = 0; i < 7; i++) {
        const iso = toIsoDate(cursor);
        const inRange = cursor >= start && cursor <= end;
        week.push({ iso, count: inRange ? (counts.get(iso) ?? 0) : null });
        cursor.setDate(cursor.getDate() + 1);
      }

      const key = `${anchor.getFullYear()}-${anchor.getMonth()}`;
      const lastGroup = result[result.length - 1];
      if (lastGroup && lastGroup.key === key) {
        lastGroup.weeks.push(week);
      } else {
        result.push({ key, label: MONTHS[anchor.getMonth()], weeks: [week] });
      }
    }
    return result;
  }, [windowStart, windowEnd, heatmap]);

  return (
    <div className="overflow-x-auto">
      {/* gap-2.5 between months vs gap-1 between weeks = the month separation */}
      <div className="flex gap-2.5">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-1">
            <span className="text-muted-foreground h-3 text-[10px] leading-3">{group.label}</span>
            <div className="flex gap-1">
              {group.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((cell) => (
                    <div
                      key={cell.iso}
                      title={cell.count !== null ? `${cell.iso}: ${cell.count}` : undefined}
                      className={cn("size-3 rounded-[3px]", intensityClass(cell.count))}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-muted-foreground mt-3 flex items-center gap-1 text-xs">
        <span>Less</span>
        <span className="bg-muted size-3 rounded-[3px]" />
        <span className="size-3 rounded-[3px] bg-emerald-200 dark:bg-emerald-900" />
        <span className="size-3 rounded-[3px] bg-emerald-300 dark:bg-emerald-700" />
        <span className="size-3 rounded-[3px] bg-emerald-400 dark:bg-emerald-600" />
        <span className="size-3 rounded-[3px] bg-emerald-500" />
        <span>More</span>
      </div>
    </div>
  );
}
