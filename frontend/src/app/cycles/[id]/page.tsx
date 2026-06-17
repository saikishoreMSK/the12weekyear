"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { cycleApi } from "@/features/cycle/api";
import type { Cycle } from "@/features/cycle/types";
import { AddGoalForm } from "@/features/cycle/components/add-goal-form";
import { GoalItem } from "@/features/cycle/components/goal-item";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function CycleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    cycleApi
      .get(id)
      .then(setCycle)
      .catch(() => setError(true));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function markComplete() {
    if (!cycle) return;
    await cycleApi.update(cycle.id, {
      title: cycle.title,
      objective: cycle.objective ?? undefined,
      status: "COMPLETED",
    });
    load();
  }

  async function deleteCycle() {
    if (!cycle) return;
    if (!window.confirm("Delete this cycle and all its goals? This can't be undone.")) return;
    await cycleApi.remove(cycle.id);
    router.replace("/cycles");
  }

  if (error) {
    return (
      <Shell>
        <p className="text-destructive text-sm">Cycle not found.</p>
      </Shell>
    );
  }

  if (!cycle) {
    return (
      <Shell>
        <p className="text-muted-foreground text-sm">Loading…</p>
      </Shell>
    );
  }

  const dayProgress = cycle.currentDay
    ? Math.round((cycle.currentDay / cycle.totalDays) * 100)
    : 0;

  return (
    <Shell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{cycle.title}</h1>
          <p className="text-muted-foreground text-sm">
            {cycle.startDate} → {cycle.endDate} · {cycle.status.toLowerCase()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/cycles/${cycle.id}/reviews`}>Weekly reviews</Link>
          </Button>
          {cycle.status === "ACTIVE" && (
            <Button variant="outline" size="sm" onClick={markComplete}>
              Mark complete
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {cycle.currentDay
              ? `Day ${cycle.currentDay} / ${cycle.totalDays}`
              : "Not in progress"}
          </span>
          {cycle.currentWeek && (
            <span className="text-muted-foreground">
              Week {cycle.currentWeek} / {cycle.totalWeeks}
            </span>
          )}
        </div>
        <Progress value={dayProgress} />
      </div>

      {cycle.objective && (
        <p className="bg-muted/50 mt-4 rounded-lg border p-4 text-sm">{cycle.objective}</p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Goals</h2>
        <AddGoalForm cycleId={cycle.id} totalWeeks={cycle.totalWeeks} onAdded={load} />
      </div>

      <div className="mt-4 space-y-3">
        {cycle.goals.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No goals yet. Break your objective into measurable targets.
          </p>
        )}
        {cycle.goals.map((goal) => (
          <GoalItem key={goal.id} cycleId={cycle.id} goal={goal} onChanged={load} />
        ))}
      </div>

      <div className="mt-10 border-t pt-4">
        <Button variant="ghost" size="sm" className="text-destructive" onClick={deleteCycle}>
          Delete cycle
        </Button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
