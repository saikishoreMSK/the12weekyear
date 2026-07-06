import { useQuery, useQueryClient } from "@tanstack/react-query";

import { toIsoDate } from "../date";
import { habitApi } from "./api";
import { writeCompletion } from "./completion-writer";
import type { Habit } from "./types";

export const HABITS_KEY = ["habits"] as const;

/** Cached list of the user's habits (shared by the Habits and Week screens). */
export function useHabits() {
  return useQuery({ queryKey: HABITS_KEY, queryFn: () => habitApi.list() });
}

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

/** Mutations that keep the cached habit list in sync (optimistically). Shared by web + mobile. */
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
