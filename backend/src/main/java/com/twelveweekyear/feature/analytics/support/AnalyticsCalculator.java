package com.twelveweekyear.feature.analytics.support;

import com.twelveweekyear.feature.analytics.dto.AnalyticsResponse;
import com.twelveweekyear.feature.analytics.dto.HeatmapDay;
import com.twelveweekyear.feature.analytics.dto.WeekdayCount;
import com.twelveweekyear.feature.habit.support.Streaks;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Derives overall analytics from per-day completion counts (summed across all of a user's habits).
 * Streaks/totals are all-time; the weekday breakdown and heatmap cover [windowStart, today].
 */
public final class AnalyticsCalculator {

    private AnalyticsCalculator() {
    }

    public static AnalyticsResponse compute(LocalDate today, LocalDate windowStart,
                                            Map<LocalDate, Integer> countsByDate) {
        Set<LocalDate> activeDays = countsByDate.keySet();
        int currentStreak = Streaks.current(today, activeDays);
        int longestStreak = Streaks.longest(activeDays);
        int totalCompletions = countsByDate.values().stream().mapToInt(Integer::intValue).sum();

        // Weekday totals + heatmap entries, restricted to the window.
        long[] byWeekday = new long[7]; // index = DayOfWeek.getValue() - 1 (MON=0 .. SUN=6)
        List<HeatmapDay> heatmap = new ArrayList<>();
        countsByDate.forEach((date, count) -> {
            if (!date.isBefore(windowStart) && !date.isAfter(today)) {
                byWeekday[date.getDayOfWeek().getValue() - 1] += count;
                heatmap.add(new HeatmapDay(date, count));
            }
        });
        heatmap.sort((a, b) -> a.date().compareTo(b.date()));

        List<WeekdayCount> weekdayCounts = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            weekdayCounts.add(new WeekdayCount(day.name(), byWeekday[day.getValue() - 1]));
        }

        String bestDay = null;
        String worstDay = null;
        boolean hasWindowActivity = false;
        for (long c : byWeekday) {
            if (c > 0) {
                hasWindowActivity = true;
                break;
            }
        }
        if (hasWindowActivity) {
            DayOfWeek best = DayOfWeek.MONDAY;
            DayOfWeek worst = DayOfWeek.MONDAY;
            for (DayOfWeek day : DayOfWeek.values()) {
                long c = byWeekday[day.getValue() - 1];
                if (c > byWeekday[best.getValue() - 1]) {
                    best = day;
                }
                if (c < byWeekday[worst.getValue() - 1]) {
                    worst = day;
                }
            }
            bestDay = best.name();
            worstDay = worst.name();
        }

        return new AnalyticsResponse(
                currentStreak, longestStreak, totalCompletions, activeDays.size(),
                bestDay, worstDay, weekdayCounts, windowStart, today, heatmap);
    }
}
