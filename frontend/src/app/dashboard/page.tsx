"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { dashboardApi } from "@/features/dashboard/api";
import type { Dashboard } from "@/features/dashboard/types";
import { DashboardHabitRow } from "@/features/dashboard/components/dashboard-habit-row";
import { ApiException } from "@/lib/api/client";
import { AppHeader } from "@/components/app-header";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type State =
  | { kind: "loading" }
  | { kind: "none" } // no active cycle
  | { kind: "error" }
  | { kind: "ready"; data: Dashboard };

export default function DashboardPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(() => {
    dashboardApi
      .get()
      .then((data) => setState({ kind: "ready", data }))
      .catch((err) => {
        if (err instanceof ApiException && err.status === 404) setState({ kind: "none" });
        else setState({ kind: "error" });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        {state.kind === "loading" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {state.kind === "error" && (
          <p className="text-destructive text-sm">Couldn&apos;t load your dashboard.</p>
        )}

        {state.kind === "none" && (
          <Card>
            <CardContent className="py-10 text-center">
              <h1 className="text-lg font-semibold">No active cycle</h1>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                Start a 12-week cycle and add goals to see your sprint dashboard.
              </p>
              <Button asChild className="mt-4">
                <Link href="/cycles/new">Create a cycle</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {state.kind === "ready" && <DashboardView data={state.data} onChange={load} />}
      </main>
    </div>
  );
}

function DashboardView({ data, onChange }: { data: Dashboard; onChange: () => void }) {
  const dayProgress = data.currentDay
    ? Math.round((data.currentDay / data.totalDays) * 100)
    : 0;

  return (
    <FadeIn className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{data.cycleTitle}</h1>
        <p className="text-muted-foreground text-sm">
          {data.currentDay
            ? `Day ${data.currentDay} / ${data.totalDays}`
            : "Not in progress"}
          {data.currentWeek ? ` · Week ${data.currentWeek} / ${data.totalWeeks}` : ""}
        </p>
        <Progress value={dayProgress} className="mt-2" />
      </div>

      {/* Sprint Score */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Sprint Score</p>
              <p className="text-4xl font-bold tabular-nums">{data.sprintScore}%</p>
            </div>
            <div className="text-muted-foreground space-y-1 text-right text-xs">
              <p>Goals {data.goalsProgress}%</p>
              <p>Habits {data.habitsConsistency}%</p>
            </div>
          </div>
          <Progress value={data.sprintScore} className="mt-3" />
        </CardContent>
      </Card>

      {/* Goals */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Goals</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/cycles/${data.cycleId}`}>Manage</Link>
          </Button>
        </div>
        {data.goals.length === 0 ? (
          <p className="text-muted-foreground text-sm">No goals yet.</p>
        ) : (
          <div className="space-y-3">
            {data.goals.map((goal) => (
              <div key={goal.id} className="bg-card rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">
                    <span className="text-muted-foreground">{goal.category}: </span>
                    {goal.title}
                  </span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                </div>
                <Progress value={goal.progressPercent} className="mt-2" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Habits */}
      <section>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today&apos;s habits</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/habits">Manage</Link>
          </Button>
        </div>
        {data.habits.length === 0 ? (
          <p className="text-muted-foreground text-sm">No habits yet.</p>
        ) : (
          <div className="bg-card divide-y rounded-lg border px-4">
            {data.habits.map((habit) => (
              <DashboardHabitRow key={habit.id} habit={habit} onToggled={onChange} />
            ))}
          </div>
        )}
      </section>
    </FadeIn>
  );
}
