"use client";

import { useState } from "react";

import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { lastNDates, shortDayLabel } from "@/lib/date";
import { cn } from "@/lib/utils";

interface Props {
  habit: Habit;
  days?: number;
  onChanged: (habit: Habit) => void;
}

/** Tap any of the last `days` days to set/clear its completion (backfill). */
export function HabitDayGrid({ habit, days = 14, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const completed = new Set(habit.completionDates);
  const dates = lastNDates(days);

  async function toggle(iso: string, isDone: boolean) {
    if (busy) return;
    setBusy(true);
    try {
      const updated = isDone
        ? await habitApi.unmarkDate(habit.id, iso)
        : await habitApi.markDate(habit.id, iso);
      onChanged(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {dates.map((iso) => {
        const isDone = completed.has(iso);
        const [, , day] = iso.split("-");
        return (
          <button
            key={iso}
            type="button"
            onClick={() => toggle(iso, isDone)}
            disabled={busy}
            title={shortDayLabel(iso)}
            aria-label={`${shortDayLabel(iso)} — ${isDone ? "done" : "not done"}`}
            aria-pressed={isDone}
            className={cn(
              "flex size-10 items-center justify-center rounded-md border text-sm tabular-nums transition-colors",
              isDone
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-input text-muted-foreground hover:border-emerald-500/60",
            )}
          >
            {Number(day)}
          </button>
        );
      })}
    </div>
  );
}
