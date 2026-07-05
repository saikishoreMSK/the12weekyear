"use client";

import { useEffect, useMemo, useState } from "react";

import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { useOptimisticHabits } from "@/features/habit/use-optimistic-habits";
import { AddHabitForm } from "@/features/habit/components/add-habit-form";
import { HabitItem } from "@/features/habit/components/habit-item";
import { ArchivedHabitItem } from "@/features/habit/components/archived-habit-item";
import { WeekStrip } from "@/features/habit/components/week-strip";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { parseIsoDate, toIsoDate } from "@/lib/date";

const TODAY = toIsoDate(new Date());

function dayLabel(iso: string): string {
  if (iso === TODAY) return "Today";
  return parseIsoDate(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function HabitsPage() {
  const { habits, setHabits, toggle, syncError } = useOptimisticHabits();
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TODAY);

  useEffect(() => {
    let active = true;
    habitApi
      .list()
      .then((data) => active && setHabits(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [setHabits]);

  function upsert(updated: Habit) {
    setHabits((prev) => (prev ? prev.map((h) => (h.id === updated.id ? updated : h)) : prev));
  }

  function removeHabit(id: string) {
    setHabits((prev) => (prev ? prev.filter((h) => h.id !== id) : prev));
  }

  const active = habits?.filter((h) => h.active) ?? [];
  const archived = habits?.filter((h) => !h.active) ?? [];

  const activeDays = useMemo(() => {
    const set = new Set<string>();
    active.forEach((h) => h.completionDates.forEach((d) => set.add(d)));
    return set;
  }, [active]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <AddHabitForm onAdded={(h) => setHabits((prev) => [...(prev ?? []), h])} />
        </div>

        {error && <p className="text-destructive mt-6 text-sm">Couldn&apos;t load your habits.</p>}
        {syncError && (
          <p className="text-destructive mt-4 text-xs">
            A change didn&apos;t sync — refresh to make sure everything saved.
          </p>
        )}

        {habits === null && !error && (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
        )}

        {habits && (
          <>
            <div className="mt-6">
              <WeekStrip selected={selectedDate} onSelect={setSelectedDate} activeDays={activeDays} />
            </div>

            <p className="text-muted-foreground mt-3 text-sm font-medium">{dayLabel(selectedDate)}</p>

            <div className="mt-2 space-y-3">
              {active.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No active habits. Add the daily actions that drive your goals.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                active.map((habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    selectedDate={selectedDate}
                    disabled={selectedDate > TODAY}
                    onToggle={toggle}
                  />
                ))
              )}
            </div>

            {archived.length > 0 && (
              <section className="mt-10">
                <h2 className="text-muted-foreground mb-2 text-sm font-semibold uppercase tracking-wide">
                  Archived
                </h2>
                <div className="space-y-2">
                  {archived.map((habit) => (
                    <ArchivedHabitItem
                      key={habit.id}
                      habit={habit}
                      onChanged={upsert}
                      onDeleted={removeHabit}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
