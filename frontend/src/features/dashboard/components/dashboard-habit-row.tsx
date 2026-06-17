"use client";

import { useState } from "react";
import { Check, Flame } from "lucide-react";

import { habitApi } from "@/features/habit/api";
import type { DashboardHabit } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

interface Props {
  habit: DashboardHabit;
  /** Called after a successful toggle so the parent can re-fetch and recompute the score. */
  onToggled: () => void;
}

export function DashboardHabitRow({ habit, onToggled }: Props) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await habitApi.toggleToday(habit.id);
      onToggled();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={habit.completedToday}
        aria-label={habit.completedToday ? "Mark not done today" : "Mark done today"}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          habit.completedToday
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
        {habit.sprintCompletionRate}%
      </span>
    </div>
  );
}
