export interface WeekdayCount {
  dayOfWeek: string; // e.g. "MONDAY"
  count: number;
}

export interface HeatmapDay {
  date: string; // yyyy-MM-dd
  count: number;
}

/** Mirrors the backend `AnalyticsResponse`. */
export interface Analytics {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  activeDays: number;
  bestDayOfWeek: string | null;
  worstDayOfWeek: string | null;
  weekdayCounts: WeekdayCount[];
  windowStart: string;
  windowEnd: string;
  heatmap: HeatmapDay[];
}
