import { useQuery } from "@tanstack/react-query";

import { quarterApi } from "./api";

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
