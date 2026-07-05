"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { toIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  selected: string; // yyyy-MM-dd
  onSelect: (iso: string) => void;
  /** Dates (yyyy-MM-dd) with at least one completed habit — shown as a dot. */
  activeDays: Set<string>;
}

function startOfWeek(base: Date): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return d;
}

/** A fixed 7-day (Sun–Sat) row with ‹ / › to page one week at a time. No horizontal scroll. */
export function WeekStrip({ selected, onSelect, activeDays }: Props) {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, …
  const todayIso = toIsoDate(new Date());

  const weekStart = startOfWeek(new Date());
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous week"
        onClick={() => setWeekOffset((o) => o - 1)}
        className="border-input hover:bg-accent flex size-8 shrink-0 items-center justify-center rounded-md border"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="grid flex-1 grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = toIsoDate(d);
          const isSelected = iso === selected;
          const future = iso > todayIso;
          return (
            <button
              key={iso}
              type="button"
              disabled={future}
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              className={cn(
                "flex flex-col items-center rounded-lg border py-2 transition-colors",
                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-accent",
                future && "cursor-not-allowed opacity-30",
              )}
            >
              <span className={cn("text-xs", !isSelected && "text-muted-foreground")}>{DOW[d.getDay()]}</span>
              <span className="mt-0.5 text-sm font-semibold tabular-nums">{d.getDate()}</span>
              <span
                className={cn(
                  "mt-1 size-1.5 rounded-full",
                  activeDays.has(iso) ? (isSelected ? "bg-primary-foreground" : "bg-emerald-500") : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Next week"
        onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
        disabled={weekOffset >= 0}
        className="border-input hover:bg-accent flex size-8 shrink-0 items-center justify-center rounded-md border disabled:opacity-30"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
