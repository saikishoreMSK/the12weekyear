import { useQuery, useQueryClient } from "@tanstack/react-query";

import { syncDashboardFromQuarters } from "../cache";
import { toIsoDate } from "../date";
import { recomputeHabit, recomputeQuarterDerived } from "../calc";
import type { Quarter } from "../quarter/types";
import { habitApi } from "./api";
import { writeCompletion } from "./completion-writer";
import type { Habit } from "./types";

export const HABITS_KEY = ["habits"] as const;

/** Cached list of the user's habits (shared by the Habits and Week screens). */
export function useHabits() {
  return useQuery({ queryKey: HABITS_KEY, queryFn: () => habitApi.list() });
}

/** Toggle a completion locally and recompute the habit's derived stats (streak, %, total). */
function applyLocal(habit: Habit, dateIso: string, done: boolean, todayIso: string): Habit {
  const dates = new Set(habit.completionDates);
  if (done) dates.add(dateIso);
  else dates.delete(dateIso);
  return recomputeHabit({ ...habit, completionDates: [...dates] }, todayIso);
}

/** Mutations that keep the cached habit list in sync (optimistically). Shared by web + mobile. */
export function useHabitActions() {
  const qc = useQueryClient();

  return {
    /**
     * Flip a habit's completion for a date: instant cache update (with recomputed streak/% and a
     * recomputed quarter score) + debounced background write.
     */
    toggle(habit: Habit, dateIso: string) {
      const today = toIsoDate(new Date());
      const done = !habit.completionDates.includes(dateIso);

      qc.setQueryData<Habit[]>(HABITS_KEY, (old) =>
        old?.map((h) => (h.id === habit.id ? applyLocal(h, dateIso, done, today) : h)),
      );

      // Recompute any cached quarter's habit rows + consistency + score from the updated habits.
      const habits = qc.getQueryData<Habit[]>(HABITS_KEY) ?? [];
      const byId = new Map(habits.map((h) => [h.id, h]));
      qc.getQueryCache()
        .findAll({ queryKey: ["quarter"] })
        .forEach((q) =>
          qc.setQueryData<Quarter>(q.queryKey, (old) =>
            old ? recomputeQuarterDerived(old, byId, today) : old,
          ),
        );
      syncDashboardFromQuarters(qc);

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
