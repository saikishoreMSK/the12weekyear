"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { quarterApi } from "@/features/quarter/api";
import type { Goal, GoalStatus } from "@/features/quarter/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  quarterId: string;
  goal: Goal;
  onChanged: () => void;
}

function StatusChip({ status }: { status: GoalStatus }) {
  const map: Record<GoalStatus, { label: string; cls: string }> = {
    DONE: { label: "Done", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    THIS_WEEK: { label: "This week", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
    UPCOMING: { label: "Upcoming", cls: "bg-muted text-muted-foreground" },
    MISSED: { label: "Missed", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  };
  const { label, cls } = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

export function GoalItem({ quarterId, goal, onChanged }: Props) {
  const [busy, setBusy] = useState(false);

  async function toggleDone() {
    setBusy(true);
    try {
      await quarterApi.updateGoal(quarterId, goal.id, { done: !goal.done });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await quarterApi.removeGoal(quarterId, goal.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
      <button
        type="button"
        onClick={toggleDone}
        disabled={busy}
        aria-pressed={goal.done}
        aria-label={goal.done ? "Mark not done" : "Mark done"}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          goal.done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-muted-foreground/30 text-transparent hover:border-emerald-500/60",
        )}
      >
        <Check className="size-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", goal.done && "text-muted-foreground line-through")}>
          {goal.title}
        </p>
        <p className="text-muted-foreground text-xs">Week {goal.week}</p>
      </div>

      <StatusChip status={goal.status} />
      <Button size="sm" variant="ghost" className="text-destructive" onClick={remove} disabled={busy}>
        Delete
      </Button>
    </div>
  );
}
