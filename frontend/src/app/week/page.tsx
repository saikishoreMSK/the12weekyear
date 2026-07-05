"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { quarterApi } from "@/features/quarter/api";
import type { Quarter } from "@/features/quarter/types";
import { GoalItem } from "@/features/quarter/components/goal-item";
import { AddGoalForm } from "@/features/quarter/components/add-goal-form";
import { weekDates, weekRangeLabel } from "@/features/quarter/week-dates";
import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { HabitWeekGrid } from "@/features/habit/components/habit-week-grid";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { ApiException } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/app-header";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function WeekView() {
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [notPlanned, setNotPlanned] = useState(false);
  const [error, setError] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const loadQuarter = useCallback(() => {
    quarterApi
      .current()
      .then(setQuarter)
      .catch((err) => {
        if (err instanceof ApiException && err.status === 404) setNotPlanned(true);
        else setError(true);
      });
  }, []);

  useEffect(() => {
    loadQuarter();
    habitApi.list().then(setHabits).catch(() => setError(true));
  }, [loadQuarter]);

  // Default the selected week to the quarter's current week once it loads.
  useEffect(() => {
    if (quarter && selectedWeek === null) setSelectedWeek(quarter.currentWeek ?? 1);
  }, [quarter, selectedWeek]);

  function upsertHabit(updated: Habit) {
    setHabits((hs) => hs?.map((h) => (h.id === updated.id ? updated : h)) ?? null);
  }

  async function toggle(habit: Habit, iso: string) {
    const done = habit.completionDates.includes(iso);
    upsertHabit(done ? await habitApi.unmarkDate(habit.id, iso) : await habitApi.markDate(habit.id, iso));
  }

  const activeHabits = habits?.filter((h) => h.active) ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        {error && <p className="text-destructive text-sm">Couldn&apos;t load this week.</p>}

        {notPlanned && (
          <div className="py-16 text-center">
            <h1 className="text-lg font-semibold">No quarter planned yet</h1>
            <p className="text-muted-foreground mt-1 text-sm">Plan the current quarter to see your week.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        )}

        {!notPlanned && !error && (!quarter || !habits || selectedWeek === null) && (
          <>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-4 h-24 w-full" />
          </>
        )}

        {quarter && habits && selectedWeek !== null && !notPlanned && (
          <FadeIn className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Week {selectedWeek}
                {quarter.currentWeek === selectedWeek && (
                  <span className="text-muted-foreground ml-2 align-middle text-sm font-normal">this week</span>
                )}
              </h1>
              <p className="text-muted-foreground text-sm">
                {weekRangeLabel(quarter.startDate, quarter.endDate, selectedWeek)} · Q{quarter.quarterNumber}{" "}
                {quarter.year}
              </p>
            </div>

            {/* Quarter-week selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: quarter.totalWeeks }, (_, i) => i + 1).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeek(w)}
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md border text-sm tabular-nums transition-colors",
                    w === selectedWeek
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent",
                    quarter.currentWeek === w && w !== selectedWeek ? "ring-primary/40 ring-2" : "",
                  )}
                  aria-label={`Week ${w}`}
                >
                  {w}
                </button>
              ))}
            </div>

            <section>
              <h2 className="mb-2 text-lg font-semibold">Week {selectedWeek} goal</h2>
              {(() => {
                const goal = quarter.goals.find((g) => g.week === selectedWeek);
                return goal ? (
                  <GoalItem
                    quarterId={quarter.id}
                    quarterStart={quarter.startDate}
                    quarterEnd={quarter.endDate}
                    goal={goal}
                    onChanged={loadQuarter}
                  />
                ) : (
                  <AddGoalForm
                    quarterId={quarter.id}
                    quarterStart={quarter.startDate}
                    quarterEnd={quarter.endDate}
                    totalWeeks={quarter.totalWeeks}
                    takenWeeks={quarter.goals.map((g) => g.week)}
                    defaultWeek={selectedWeek}
                    onAdded={loadQuarter}
                  />
                );
              })()}
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold">Habit completion</h2>
              {activeHabits.length === 0 ? (
                <p className="text-muted-foreground text-sm">No habits yet.</p>
              ) : (
                <HabitWeekGrid
                  habits={activeHabits}
                  days={weekDates(quarter.startDate, quarter.endDate, selectedWeek)}
                  onToggle={toggle}
                />
              )}
            </section>

            <Button asChild variant="outline" size="sm">
              <Link href={`/quarters/${quarter.id}/reviews`}>Write this week&apos;s review</Link>
            </Button>
          </FadeIn>
        )}
      </main>
    </div>
  );
}

export default function WeekPage() {
  return (
    <RequireAuth>
      <WeekView />
    </RequireAuth>
  );
}
