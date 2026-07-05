"use client";

import { useState } from "react";
import { Check, Flame } from "lucide-react";

import { writeCompletion } from "@/features/habit/completion-writer";
import type { QuarterHabit } from "@/features/quarter/types";
import { toIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";

/** Today's toggle for a habit on the quarter view — flips instantly, writes in the background. */
export function QuarterHabitRow({ habit }: { habit: QuarterHabit }) {
  const [completed, setCompleted] = useState(habit.completedToday);

  function toggle() {
    const next = !completed;
    setCompleted(next);
    writeCompletion(habit.id, toIsoDate(new Date()), next);
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={completed}
        aria-label={completed ? "Mark not done today" : "Mark done today"}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-muted-foreground/30 text-transparent hover:border-emerald-500/60",
        )}
      >
        <Check className="size-4" />
      </button>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{habit.name}</span>
      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
        <Flame className="size-3.5 text-orange-500" />
        {habit.currentStreak}
      </span>
      <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
        {habit.completionRate}%
      </span>
    </div>
  );
}
