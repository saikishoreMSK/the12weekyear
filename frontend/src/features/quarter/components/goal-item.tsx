"use client";

import { useState } from "react";

import { quarterApi } from "@/features/quarter/api";
import type { Goal, GoalPace } from "@/features/quarter/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface Props {
  quarterId: string;
  goal: Goal;
  onChanged: () => void;
}

function PaceChip({ pace }: { pace: GoalPace }) {
  const styles: Record<GoalPace, string> = {
    AHEAD: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    ON_TRACK: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    BEHIND: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  };
  const label = { AHEAD: "Ahead", ON_TRACK: "On track", BEHIND: "Behind" }[pace];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[pace]}`}>{label}</span>;
}

export function GoalItem({ quarterId, goal, onChanged }: Props) {
  const [value, setValue] = useState(String(goal.currentValue));
  const [busy, setBusy] = useState(false);

  const dirty = Number(value) !== goal.currentValue;
  const weekLabel =
    goal.weekStart === goal.weekEnd ? `Week ${goal.weekStart}` : `Weeks ${goal.weekStart}–${goal.weekEnd}`;

  async function saveProgress() {
    const next = Number(value);
    if (!Number.isFinite(next) || next < 0 || !dirty) return;
    setBusy(true);
    try {
      await quarterApi.updateGoal(quarterId, goal.id, { currentValue: next });
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
    <div className="bg-card space-y-2 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs font-medium">
              {goal.category}
            </span>
            {goal.pace && <PaceChip pace={goal.pace} />}
          </div>
          <p className="mt-1.5 text-sm font-medium">{goal.title}</p>
          <p className="text-muted-foreground text-xs">{weekLabel}</p>
        </div>
        <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
          {goal.currentValue} / {goal.targetValue} {goal.unit}
        </span>
      </div>

      <Progress value={goal.progressPercent} />

      <div className="flex items-center gap-2 pt-1">
        <Input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 w-24"
          aria-label={`Update progress for ${goal.title}`}
        />
        <Button size="sm" variant="secondary" onClick={saveProgress} disabled={!dirty || busy}>
          Update
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={remove} disabled={busy}>
          Delete
        </Button>
      </div>
    </div>
  );
}
