"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { quarterApi } from "@/features/quarter/api";
import type { Quarter } from "@/features/quarter/types";
import { GoalItem } from "@/features/quarter/components/goal-item";
import { AddGoalForm } from "@/features/quarter/components/add-goal-form";
import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { HabitItem } from "@/features/habit/components/habit-item";
import { WeekStrip } from "@/features/habit/components/week-strip";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { ApiException } from "@/lib/api/client";
import { toIsoDate } from "@/lib/date";
import { AppHeader } from "@/components/app-header";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const TODAY = toIsoDate(new Date());

function WeekView() {
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [notPlanned, setNotPlanned] = useState(false);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TODAY);

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

  function upsertHabit(updated: Habit) {
    setHabits((hs) => hs?.map((h) => (h.id === updated.id ? updated : h)) ?? null);
  }

  const activeHabits = habits?.filter((h) => h.active) ?? [];
  const activeDays = useMemo(() => {
    const set = new Set<string>();
    activeHabits.forEach((h) => h.completionDates.forEach((d) => set.add(d)));
    return set;
  }, [activeHabits]);

  const currentWeekGoal =
    quarter && quarter.currentWeek != null
      ? quarter.goals.find((g) => g.week === quarter.currentWeek)
      : undefined;

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

        {!notPlanned && !error && (!quarter || !habits) && (
          <>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-4 h-24 w-full" />
          </>
        )}

        {quarter && habits && !notPlanned && (
          <FadeIn className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Week {quarter.currentWeek} / {quarter.totalWeeks}
              </h1>
              <p className="text-muted-foreground text-sm">
                Q{quarter.quarterNumber} · {quarter.label} {quarter.year}
              </p>
            </div>

            <section>
              <h2 className="mb-2 text-lg font-semibold">This week&apos;s goal</h2>
              {currentWeekGoal ? (
                <GoalItem quarterId={quarter.id} goal={currentWeekGoal} onChanged={loadQuarter} />
              ) : (
                <AddGoalForm
                  quarterId={quarter.id}
                  totalWeeks={quarter.totalWeeks}
                  takenWeeks={quarter.goals.map((g) => g.week)}
                  defaultWeek={quarter.currentWeek ?? 1}
                  onAdded={loadQuarter}
                />
              )}
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold">Habits</h2>
              {activeHabits.length === 0 ? (
                <p className="text-muted-foreground text-sm">No habits yet.</p>
              ) : (
                <>
                  <WeekStrip selected={selectedDate} onSelect={setSelectedDate} activeDays={activeDays} />
                  <div className="mt-3 space-y-3">
                    {activeHabits.map((habit) => (
                      <HabitItem
                        key={habit.id}
                        habit={habit}
                        selectedDate={selectedDate}
                        disabled={selectedDate > TODAY}
                        onChanged={upsertHabit}
                      />
                    ))}
                  </div>
                </>
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
