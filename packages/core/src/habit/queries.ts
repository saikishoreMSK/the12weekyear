import { useQuery } from "@tanstack/react-query";

import { habitApi } from "./api";

export const HABITS_KEY = ["habits"] as const;

/** Cached list of the user's habits (shared by the Habits and Week screens). */
export function useHabits() {
  return useQuery({ queryKey: HABITS_KEY, queryFn: () => habitApi.list() });
}
