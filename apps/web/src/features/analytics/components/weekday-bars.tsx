"use client";

import type { WeekdayCount } from "@/features/analytics/types";

const SHORT: Record<string, string> = {
  MONDAY: "Mo",
  TUESDAY: "Tu",
  WEDNESDAY: "We",
  THURSDAY: "Th",
  FRIDAY: "Fr",
  SATURDAY: "Sa",
  SUNDAY: "Su",
};

/** Compact vertical-bar chart of completions per weekday. */
export function WeekdayBars({ data }: { data: WeekdayCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex items-end justify-between gap-2">
      {data.map((d) => {
        const heightPct = Math.round((d.count / max) * 100);
        return (
          <div key={d.dayOfWeek} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-muted-foreground text-xs tabular-nums">{d.count}</span>
            <div className="bg-muted flex h-20 w-full items-end overflow-hidden rounded">
              <div
                className="bg-primary w-full rounded transition-[height] duration-500"
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-muted-foreground text-xs">{SHORT[d.dayOfWeek] ?? d.dayOfWeek}</span>
          </div>
        );
      })}
    </div>
  );
}
