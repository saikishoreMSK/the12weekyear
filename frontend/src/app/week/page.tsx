"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { quarterApi } from "@/features/quarter/api";
import type { Quarter } from "@/features/quarter/types";
import { GoalItem } from "@/features/quarter/components/goal-item";
import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { ApiException } from "@/lib/api/client";
import { parseIsoDate, toIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/app-header";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function weekDays(quarter: Quarter): Date[] {
  const start = parseIsoDate(quarter.startDate);
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() + ((quarter.currentWeek ?? 1) - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function WeekView() {
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [notPlanned, setNotPlanned] = useState(false);
  const [error, setError] = useState(false);

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

  async function toggle(habit: Habit, iso: string) {
    const done = habit.completionDates.includes(iso);
    const updated = done
      ? await habitApi.unmarkDate(habit.id, iso)
      : await habitApi.markDate(habit.id, iso);
    setHabits((hs) => hs?.map((h) => (h.id === habit.id ? updated : h)) ?? null);
  }

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
            <WeekHeader quarter={quarter} />

            <section>
              <h2 className="mb-2 text-lg font-semibold">This week&apos;s goals</h2>
              <ActiveGoals quarter={quarter} onChanged={loadQuarter} />
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold">Habits</h2>
              {habits.length === 0 ? (
                <p className="text-muted-foreground text-sm">No habits yet.</p>
              ) : (
                <HabitGrid quarter={quarter} habits={habits} onToggle={toggle} />
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

function WeekHeader({ quarter }: { quarter: Quarter }) {
  const days = weekDays(quarter);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        Week {quarter.currentWeek} / {quarter.totalWeeks}
      </h1>
      <p className="text-muted-foreground text-sm">
        {fmt(days[0])} – {fmt(days[6])} · Q{quarter.quarterNumber} {quarter.year}
      </p>
    </div>
  );
}

function ActiveGoals({ quarter, onChanged }: { quarter: Quarter; onChanged: () => void }) {
  const week = quarter.currentWeek ?? 0;
  const active = quarter.goals.filter((g) => week >= g.weekStart && week <= g.weekEnd);
  if (active.length === 0) {
    return <p className="text-muted-foreground text-sm">No goals scheduled for this week.</p>;
  }
  return (
    <div className="space-y-3">
      {active.map((goal) => (
        <GoalItem key={goal.id} quarterId={quarter.id} goal={goal} onChanged={onChanged} />
      ))}
    </div>
  );
}

function HabitGrid({
  quarter,
  habits,
  onToggle,
}: {
  quarter: Quarter;
  habits: Habit[];
  onToggle: (habit: Habit, iso: string) => void;
}) {
  const days = weekDays(quarter);
  const todayIso = toIsoDate(new Date());

  return (
    <div className="bg-card overflow-x-auto rounded-lg border p-4">
      <div className="flex items-center gap-1 pl-[40%]">
        {days.map((d) => (
          <div key={d.toISOString()} className="text-muted-foreground w-8 text-center text-xs">
            {DOW[d.getDay()]}
          </div>
        ))}
      </div>
      <div className="mt-2 space-y-2">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-1">
            <span className="w-[40%] truncate pr-2 text-sm font-medium">{habit.name}</span>
            {days.map((d) => {
              const iso = toIsoDate(d);
              const done = habit.completionDates.includes(iso);
              const future = iso > todayIso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={future}
                  onClick={() => onToggle(habit, iso)}
                  aria-label={`${habit.name} ${iso}`}
                  className={cn(
                    "size-8 rounded-md border text-xs transition-colors",
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-input hover:bg-accent",
                    future && "cursor-not-allowed opacity-30",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
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
