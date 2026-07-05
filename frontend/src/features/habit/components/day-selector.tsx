"use client";

import { useEffect, useMemo, useRef } from "react";

import { toIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WINDOW_DAYS = 90;

interface Props {
  selected: string; // yyyy-MM-dd
  onSelect: (iso: string) => void;
  /** Dates (yyyy-MM-dd) with at least one completed habit — shown as a dot. */
  activeDays: Set<string>;
}

/** Horizontally-scrollable strip of the last 90 days, ending today (auto-scrolled to the right). */
export function DaySelector({ selected, onSelect, activeDays }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: WINDOW_DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (WINDOW_DAYS - 1 - i));
      return d;
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, []);

  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2">
      {days.map((d) => {
        const iso = toIsoDate(d);
        const isSelected = iso === selected;
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            aria-pressed={isSelected}
            className={cn(
              "flex w-12 shrink-0 flex-col items-center rounded-lg border py-2 transition-colors",
              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-accent",
            )}
          >
            <span className={cn("text-xs", !isSelected && "text-muted-foreground")}>{DOW[d.getDay()]}</span>
            <span className="mt-0.5 text-sm font-semibold tabular-nums">{d.getDate()}</span>
            <span
              className={cn(
                "mt-1 size-1.5 rounded-full",
                activeDays.has(iso)
                  ? isSelected
                    ? "bg-primary-foreground"
                    : "bg-emerald-500"
                  : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
