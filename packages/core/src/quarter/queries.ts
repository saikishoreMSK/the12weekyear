import { useQuery, useQueryClient } from "@tanstack/react-query";

import { quarterApi } from "./api";
import { writeGoal } from "./goal-writer";
import type { Goal, GoalStatus, Quarter } from "./types";

/** The 2×2 year overview, cached per year. */
export function useDashboard(year: number) {
  return useQuery({ queryKey: ["dashboard", year], queryFn: () => quarterApi.dashboard(year) });
}

/**
 * The quarter containing today (shared by the Quarter and Week screens). retry:false so a 404 —
 * meaning "not planned yet" — surfaces immediately instead of being retried.
 */
export function useCurrentQuarter() {
  return useQuery({
    queryKey: ["quarter", "current"],
    queryFn: () => quarterApi.current(),
    retry: false,
  });
}

/** A single quarter by id, cached (used by the quarter detail view). */
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
 * in the background via the debounced goal-writer. Shared by web + mobile.
 */
export function useGoalActions() {
  const qc = useQueryClient();

  // Patch whichever quarter caches hold this quarter (the "current" view and/or the detail view).
  function patch(quarterId: string, map: (q: Quarter) => Quarter) {
    qc.setQueryData<Quarter>(["quarter", "current"], (q) => (q ? map(q) : q));
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
