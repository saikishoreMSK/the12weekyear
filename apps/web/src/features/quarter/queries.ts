"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { quarterApi, type Goal, type GoalStatus, type Quarter } from "@twy/core";
import { writeGoal } from "./goal-writer";

/** Quarter read hooks live in @twy/core (shared with mobile). Re-exported for existing imports. */
export { useDashboard, useCurrentQuarter } from "@twy/core";

const CURRENT_QUARTER_KEY = ["quarter", "current"] as const;

/** A single quarter by id, cached (used by the quarter detail page). */
export function useQuarter(id: string) {
  return useQuery({ queryKey: ["quarter", id], queryFn: () => quarterApi.get(id) });
}

/** Optimistic status matching the backend's derivation, for instant feedback before the refetch. */
function goalStatus(week: number, currentWeek: number | null, done: boolean): GoalStatus {
  if (done) return "DONE";
  if (currentWeek == null) return "UPCOMING";
  if (week < currentWeek) return "MISSED";
  if (week === currentWeek) return "THIS_WEEK";
  return "UPCOMING";
}

/**
 * Weekly-goal mutations that update the cached quarter optimistically (instant tick), then persist
 * in the background via the debounced goal-writer — mirrors the habit completion flow.
 * Stays app-local for now; migrates into @twy/core with the mobile mutation work (M3).
 */
export function useGoalActions() {
  const qc = useQueryClient();

  // Patch whichever quarter caches hold this quarter (the "current" view and/or the detail view).
  function patch(quarterId: string, map: (q: Quarter) => Quarter) {
    qc.setQueryData<Quarter>(CURRENT_QUARTER_KEY, (q) => (q ? map(q) : q));
    qc.setQueryData<Quarter>(["quarter", quarterId], (q) => (q ? map(q) : q));
  }

  return {
    toggle(quarterId: string, goal: Goal, currentWeek: number | null) {
      const done = !goal.done;
      patch(quarterId, (q) => ({
        ...q,
        goals: q.goals.map((g) =>
          g.id === goal.id ? { ...g, done, status: goalStatus(g.week, currentWeek, done) } : g,
        ),
      }));
      writeGoal(quarterId, goal.id, done);
    },

    async remove(quarterId: string, goalId: string) {
      patch(quarterId, (q) => ({ ...q, goals: q.goals.filter((g) => g.id !== goalId) }));
      try {
        await quarterApi.removeGoal(quarterId, goalId);
      } catch {
        qc.invalidateQueries({ queryKey: ["quarter"] });
      }
    },
  };
}
