"use client";

import { useMemo, useState } from "react";

import { useHabits, useHabitActions } from "@/features/habit/queries";
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
  const { data: habits, isLoading, isError } = useHabits();
  const actions = useHabitActions();
  const [selectedDate, setSelectedDate] = useState(TODAY);

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
          <AddHabitForm onAdded={actions.add} />
        </div>

        {isError && <p className="text-destructive mt-6 text-sm">Couldn&apos;t load your habits.</p>}

        {isLoading && (
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
                    onToggle={actions.toggle}
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
                      onChanged={actions.update}
                      onDeleted={actions.remove}
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
