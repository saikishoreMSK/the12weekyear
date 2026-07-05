"use client";

import { useCallback, useEffect, useState } from "react";

import { toIsoDate } from "@/lib/date";
import { onCompletionError, writeCompletion } from "./completion-writer";
import type { Habit } from "./types";

/** Apply a completion change to a habit locally (optimistic), before the server confirms. */
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
 * Holds a habit list with optimistic completion toggling: the checkmark flips instantly and the
 * write goes out in the background (debounced). Streak/percentage refresh on the next load.
 * If a background write fails, {@code syncError} flips so the page can prompt a refresh.
 */
export function useOptimisticHabits() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    onCompletionError(() => setSyncError(true));
    return () => onCompletionError(null);
  }, []);

  const toggle = useCallback((habit: Habit, dateIso: string) => {
    const done = !habit.completionDates.includes(dateIso);
    setHabits((hs) => hs?.map((h) => (h.id === habit.id ? applyLocal(h, dateIso, done) : h)) ?? hs);
    writeCompletion(habit.id, dateIso, done);
  }, []);

  return { habits, setHabits, toggle, syncError };
}
