"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { quarterApi } from "@/features/quarter/api";
import { useQuarter } from "@/features/quarter/queries";
import { AddGoalForm } from "@/features/quarter/components/add-goal-form";
import { GoalItem } from "@/features/quarter/components/goal-item";
import { QuarterHabitRow } from "@/features/quarter/components/quarter-habit-row";
import { AppHeader } from "@/components/app-header";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuarterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: quarter, isError: error, refetch } = useQuarter(id);

  async function deleteQuarter() {
    if (!quarter) return;
    if (!window.confirm("Delete this quarter and all its goals & reviews? This can't be undone.")) return;
    await quarterApi.remove(quarter.id);
    router.replace("/dashboard");
  }

  if (error) {
    return (
      <Shell>
        <p className="text-destructive text-sm">Quarter not found.</p>
      </Shell>
    );
  }

  if (!quarter) {
    return (
      <Shell>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-4 h-28 w-full" />
      </Shell>
    );
  }

  const dayProgress = quarter.currentDay
    ? Math.round((quarter.currentDay / quarter.totalDays) * 100)
    : quarter.state === "COMPLETED"
      ? 100
      : 0;

  return (
    <Shell>
      <FadeIn className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Q{quarter.quarterNumber} · {quarter.label} {quarter.year}
            </h1>
            <p className="text-muted-foreground text-sm">
              {quarter.title ? `${quarter.title} · ` : ""}
              {quarter.state.toLowerCase()}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quarters/${quarter.id}/reviews`}>Reviews</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quarters/${quarter.id}/report`}>Report</Link>
            </Button>
          </div>
        </div>

        {/* Score + progress */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Quarter Score</p>
                <p className="text-4xl font-bold tabular-nums">{quarter.sprintScore}%</p>
              </div>
              <div className="text-muted-foreground space-y-1 text-right text-xs">
                <p>Goals {quarter.goalsProgress}%</p>
                <p>Habits {quarter.habitsConsistency}%</p>
              </div>
            </div>
            <Progress value={quarter.sprintScore} className="mt-3" />
            <div className="text-muted-foreground mt-3 flex justify-between text-xs">
              <span>
                {quarter.currentDay
                  ? `Day ${quarter.currentDay} / ${quarter.totalDays}`
                  : quarter.state === "UPCOMING"
                    ? `Starts ${quarter.startDate}`
                    : "Quarter complete"}
              </span>
              {quarter.currentWeek && <span>Week {quarter.currentWeek} / {quarter.totalWeeks}</span>}
            </div>
          </CardContent>
        </Card>

        {quarter.objective && (
          <p className="bg-muted/50 rounded-lg border p-4 text-sm">{quarter.objective}</p>
        )}

        {/* Goals */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Weekly goals</h2>
            <AddGoalForm
              quarterId={quarter.id}
              quarterStart={quarter.startDate}
              quarterEnd={quarter.endDate}
              totalWeeks={quarter.totalWeeks}
              takenWeeks={quarter.goals.map((g) => g.week)}
              onAdded={() => refetch()}
            />
          </div>
          {quarter.goals.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No goals yet. Add one focus per week.
            </p>
          ) : (
            <div className="space-y-3">
              {quarter.goals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  quarterId={quarter.id}
                  quarterStart={quarter.startDate}
                  quarterEnd={quarter.endDate}
                  currentWeek={quarter.currentWeek}
                  goal={goal}
                />
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
          {quarter.habits.length === 0 ? (
            <p className="text-muted-foreground text-sm">No habits yet.</p>
          ) : (
            <div className="bg-card divide-y rounded-lg border px-4">
              {quarter.habits.map((habit) => (
                <QuarterHabitRow key={habit.id} habit={habit} />
              ))}
            </div>
          )}
        </section>

        <div className="border-t pt-4">
          <Button variant="ghost" size="sm" className="text-destructive" onClick={deleteQuarter}>
            Delete quarter
          </Button>
        </div>
      </FadeIn>
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
