"use client";

import { useQuery } from "@tanstack/react-query";

import { analyticsApi } from "./api";

/** Cached overall analytics (streaks, weekday breakdown, heatmap). */
export function useAnalytics() {
  return useQuery({ queryKey: ["analytics"], queryFn: () => analyticsApi.get() });
}
