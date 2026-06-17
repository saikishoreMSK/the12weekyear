package com.twelveweekyear.feature.habit.support;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Set;

/** Derives streak and completion statistics from a habit's raw completion dates. Pure & testable. */
public final class HabitStats {

    private HabitStats() {
    }

    public record Stats(
            int currentStreak,
            int longestStreak,
            int completionRate,
            int totalCompletions,
            boolean completedToday
    ) {
    }

    public static Stats compute(LocalDate startDate, LocalDate today, Set<LocalDate> completions) {
        return new Stats(
                Streaks.current(today, completions),
                Streaks.longest(completions),
                completionRate(startDate, today, completions),
                completions.size(),
                completions.contains(today));
    }

    /** Completed days within [startDate, today] as a percent of elapsed days, capped at 100. */
    private static int completionRate(LocalDate startDate, LocalDate today, Set<LocalDate> completions) {
        long days = ChronoUnit.DAYS.between(startDate, today) + 1;
        if (days <= 0) {
            return 0;
        }
        long completedInWindow = completions.stream()
                .filter(d -> !d.isBefore(startDate) && !d.isAfter(today))
                .count();
        int rate = (int) Math.round((completedInWindow * 100.0) / days);
        return Math.min(100, Math.max(0, rate));
    }
}
