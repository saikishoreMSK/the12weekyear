package com.twelveweekyear.feature.analytics.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Overall habit analytics. Streaks and totals are all-time; weekday breakdown and the heatmap
 * cover the window [{@code windowStart}, {@code windowEnd}]. {@code bestDayOfWeek}/
 * {@code worstDayOfWeek} are null when there is no activity in the window.
 */
public record AnalyticsResponse(
        int currentStreak,
        int longestStreak,
        int totalCompletions,
        int activeDays,
        String bestDayOfWeek,
        String worstDayOfWeek,
        List<WeekdayCount> weekdayCounts,
        LocalDate windowStart,
        LocalDate windowEnd,
        List<HeatmapDay> heatmap
) {
}
