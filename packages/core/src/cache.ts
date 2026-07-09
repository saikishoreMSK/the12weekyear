import type { QueryClient } from "@tanstack/react-query";

import type { Quarter, YearDashboard } from "./quarter/types";

/**
 * After an optimistic recompute of the quarter caches, push the fresh score into the matching
 * Dashboard tiles. The Dashboard grid is a separate cache (`["dashboard", year]`) whose tiles carry
 * their own server-computed `score`, so without this a toggle updates the Quarter/Week screens but
 * leaves the Dashboard tile stale until the next refetch. Reads the already-recomputed quarter
 * caches and copies each quarter's `sprintScore`/goal count onto the tile with the same id.
 */
export function syncDashboardFromQuarters(qc: QueryClient): void {
  const quarters = qc
    .getQueryCache()
    .findAll({ queryKey: ["quarter"] })
    .map((q) => qc.getQueryData<Quarter>(q.queryKey))
    .filter((q): q is Quarter => Boolean(q));
  if (quarters.length === 0) return;

  const byId = new Map(quarters.map((q) => [q.id, q]));
  qc.getQueryCache()
    .findAll({ queryKey: ["dashboard"] })
    .forEach((dq) =>
      qc.setQueryData<YearDashboard>(dq.queryKey, (old) => {
        if (!old) return old;
        let changed = false;
        const tiles = old.quarters.map((t) => {
          const rq = t.quarterId ? byId.get(t.quarterId) : undefined;
          if (!rq) return t;
          changed = true;
          return { ...t, score: rq.sprintScore, goalCount: rq.goals.length };
        });
        return changed ? { ...old, quarters: tiles } : old;
      }),
    );
}
