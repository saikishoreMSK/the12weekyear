import { useQuery, useQueryClient } from "@tanstack/react-query";

import { syncDashboardFromQuarters } from "../cache";
import { recomputeQuarterDerived } from "../calc";
import { toIsoDate } from "../date";
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
 * Weekly-goal mutations that update the cached quarter optimistically — the goal flips AND the
 * quarter score (goalsProgress + sprintScore) is recomputed on-device for instant feedback — then
 * persist in the background via the debounced goal-writer. Shared by web + mobile.
 */
export function useGoalActions() {
  const qc = useQueryClient();
  const today = toIsoDate(new Date());

  // Apply a transform to every cached quarter, then recompute its derived fields.
  function patchQuarters(transform: (q: Quarter) => Quarter) {
    qc.getQueryCache()
      .findAll({ queryKey: ["quarter"] })
      .forEach((q) =>
        qc.setQueryData<Quarter>(q.queryKey, (old) =>
          old ? recomputeQuarterDerived(transform(old), null, today) : old,
        ),
      );
    syncDashboardFromQuarters(qc);
  }

  return {
    toggle(quarterId: string, goal: Goal, currentWeek: number | null) {
      const done = !goal.done;
      patchQuarters((q) => ({
        ...q,
        goals: q.goals.map((g) =>
          g.id === goal.id ? { ...g, done, status: goalStatus(g.week, currentWeek, done) } : g,
        ),
      }));
      writeGoal(quarterId, goal.id, done);
    },

    async remove(quarterId: string, goalId: string) {
      patchQuarters((q) => ({ ...q, goals: q.goals.filter((g) => g.id !== goalId) }));
      try {
        await quarterApi.removeGoal(quarterId, goalId);
      } catch {
        qc.invalidateQueries({ queryKey: ["quarter"] });
      }
    },

    /** Rename a goal: optimistic title update in every cached quarter, then persist (title only —
     * doesn't affect the score, so no recompute). Keeps the optimistic value if the write fails. */
    async rename(quarterId: string, goalId: string, title: string) {
      const trimmed = title.trim();
      if (!trimmed) return;
      qc.getQueryCache()
        .findAll({ queryKey: ["quarter"] })
        .forEach((q) =>
          qc.setQueryData<Quarter>(q.queryKey, (old) =>
            old
              ? { ...old, goals: old.goals.map((g) => (g.id === goalId ? { ...g, title: trimmed } : g)) }
              : old,
          ),
        );
      try {
        await quarterApi.updateGoal(quarterId, goalId, { title: trimmed });
      } catch {
        // Keep the optimistic title; a later successful refetch reconciles with the server.
      }
    },
  };
}
