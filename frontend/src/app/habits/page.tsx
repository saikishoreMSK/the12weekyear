"use client";

import { useEffect, useState } from "react";

import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { AddHabitForm } from "@/features/habit/components/add-habit-form";
import { HabitItem } from "@/features/habit/components/habit-item";
import { AppHeader } from "@/components/app-header";
import { Stagger, StaggerItem } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    habitApi
      .list()
      .then((data) => active && setHabits(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  function upsert(updated: Habit) {
    setHabits((prev) =>
      prev ? prev.map((h) => (h.id === updated.id ? updated : h)) : prev,
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <AddHabitForm onAdded={(h) => setHabits((prev) => [...(prev ?? []), h])} />
        </div>

        <div className="mt-6 space-y-3">
          {error && <p className="text-destructive text-sm">Couldn&apos;t load your habits.</p>}

          {habits === null && !error && (
            <>
              <Skeleton className="h-[72px] w-full" />
              <Skeleton className="h-[72px] w-full" />
              <Skeleton className="h-[72px] w-full" />
            </>
          )}

          {habits?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No habits yet. Add the daily actions that drive your goals.
                </p>
              </CardContent>
            </Card>
          )}

          {habits && habits.length > 0 && (
            <Stagger className="space-y-3">
              {habits.map((habit) => (
                <StaggerItem key={habit.id}>
                  <HabitItem habit={habit} onChanged={upsert} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </main>
    </div>
  );
}
