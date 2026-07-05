"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Flame } from "lucide-react";

import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { cn } from "@/lib/utils";

interface Props {
  habit: Habit;
  /** The day (yyyy-MM-dd) the toggle marks/reflects. */
  selectedDate: string;
  /** True when the selected date is in the future (toggle disabled). */
  disabled?: boolean;
  onChanged: (habit: Habit) => void;
}

export function HabitItem({ habit, selectedDate, disabled, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const completed = habit.completionDates.includes(selectedDate);

  async function toggle() {
    if (disabled) return;
    setBusy(true);
    try {
      const updated = completed
        ? await habitApi.unmarkDate(habit.id, selectedDate)
        : await habitApi.markDate(habit.id, selectedDate);
      onChanged(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-card flex items-center gap-4 rounded-lg border p-4">
      <button
        type="button"
        onClick={toggle}
        disabled={busy || disabled}
        aria-pressed={completed}
        aria-label={completed ? "Mark not done" : "Mark done"}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-muted-foreground/30 text-transparent hover:border-emerald-500/60",
          disabled && "cursor-not-allowed opacity-40",
        )}
      >
        <Check className="size-5" />
      </button>

      <Link href={`/habits/${habit.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{habit.name}</p>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <Flame className="size-3.5 text-orange-500" />
            {habit.currentStreak} day{habit.currentStreak === 1 ? "" : "s"}
          </span>
          <span>{habit.completionRate}% done</span>
          <span className="hidden sm:inline">best {habit.longestStreak}</span>
        </div>
      </Link>
    </div>
  );
}
