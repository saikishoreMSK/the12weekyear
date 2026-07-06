"use client";

import { useQueryClient } from "@tanstack/react-query";

import { HABITS_KEY, useHabits, type Habit } from "@twy/core";
import { toIsoDate } from "@/lib/date";
import { writeCompletion } from "./completion-writer";

// The read hook + key now live in @twy/core (shared with mobile); re-exported for existing imports.
export { HABITS_KEY, useHabits };

/** Apply a completion change to a habit locally (optimistic) before the server confirms. */
function applyLocal(habit: Habit, dateIso: string, done: boolean): Habit {
  const dates = new Set(habit.completionDates);
  if (done) dates.add(dateIso);
  else dates.delete(dateIso);
  const isToday = dateIso === toIsoDate(new Date());
  return {
    ...habit,
    completionDates: [...dates],
    completedToday: isToday ? done : habit.completedToday,
  };
}

/**
 * Mutations that keep the cached habit list in sync (optimistically).
 * Stays app-local for now; migrates into @twy/core with the mobile mutation work (M3).
 */
export function useHabitActions() {
  const qc = useQueryClient();

  return {
    /** Flip a habit's completion for a date: instant cache update + debounced background write. */
    toggle(habit: Habit, dateIso: string) {
      const done = !habit.completionDates.includes(dateIso);
      qc.setQueryData<Habit[]>(HABITS_KEY, (old) =>
        old?.map((h) => (h.id === habit.id ? applyLocal(h, dateIso, done) : h)),
      );
      writeCompletion(habit.id, dateIso, done);
    },
    add(habit: Habit) {
      qc.setQueryData<Habit[]>(HABITS_KEY, (old) => [...(old ?? []), habit]);
    },
    update(habit: Habit) {
      qc.setQueryData<Habit[]>(HABITS_KEY, (old) => old?.map((h) => (h.id === habit.id ? habit : h)));
    },
    remove(id: string) {
      qc.setQueryData<Habit[]>(HABITS_KEY, (old) => old?.filter((h) => h.id !== id));
    },
  };
}
