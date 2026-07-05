"use client";

import type { Habit } from "@/features/habit/types";
import { toIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Props {
  habits: Habit[];
  /** The days of the selected quarter week. */
  days: Date[];
  onToggle: (habit: Habit, iso: string) => void;
}

/** Habits × the selected week's days — completion at a glance, tap a cell to mark/unmark. */
export function HabitWeekGrid({ habits, days, onToggle }: Props) {
  const todayIso = toIsoDate(new Date());

  return (
    <div className="bg-card overflow-x-auto rounded-lg border p-4">
      <div className="flex items-center gap-1 pl-[40%]">
        {days.map((d) => (
          <div key={toIsoDate(d)} className="text-muted-foreground w-8 text-center text-xs">
            <div>{DOW[d.getDay()]}</div>
            <div className="tabular-nums">{d.getDate()}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 space-y-2">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-1">
            <span className="w-[40%] truncate pr-2 text-sm font-medium">{habit.name}</span>
            {days.map((d) => {
              const iso = toIsoDate(d);
              const done = habit.completionDates.includes(iso);
              const future = iso > todayIso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={future}
                  onClick={() => onToggle(habit, iso)}
                  aria-label={`${habit.name} ${iso}`}
                  className={cn(
                    "size-8 rounded-md border text-xs transition-colors",
                    done ? "border-emerald-500 bg-emerald-500 text-white" : "border-input hover:bg-accent",
                    future && "cursor-not-allowed opacity-30",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
