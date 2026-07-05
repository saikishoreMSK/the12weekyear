"use client";

import { useState } from "react";

import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { Button } from "@/components/ui/button";

interface Props {
  habit: Habit;
  onChanged: (habit: Habit) => void;
  onDeleted: (id: string) => void;
}

/** A paused habit: history preserved, can be resumed or permanently deleted. */
export function ArchivedHabitItem({ habit, onChanged, onDeleted }: Props) {
  const [busy, setBusy] = useState(false);

  async function resume() {
    setBusy(true);
    try {
      onChanged(await habitApi.update(habit.id, { active: true }));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${habit.name}" and all its history? This can't be undone.`)) return;
    setBusy(true);
    try {
      await habitApi.remove(habit.id);
      onDeleted(habit.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-card/50 flex items-center gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground truncate text-sm font-medium">{habit.name}</p>
        <p className="text-muted-foreground text-xs">
          best {habit.longestStreak} · {habit.totalCompletions} total
        </p>
      </div>
      <Button size="sm" variant="secondary" onClick={resume} disabled={busy}>
        Resume
      </Button>
      <Button size="sm" variant="ghost" className="text-destructive" onClick={remove} disabled={busy}>
        Delete
      </Button>
    </div>
  );
}
