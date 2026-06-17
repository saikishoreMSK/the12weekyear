package com.twelveweekyear.feature.cycle.support;

import com.twelveweekyear.feature.cycle.domain.Cycle;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/** Derives day-of-cycle and week-of-cycle from a start date and "today". */
public final class CycleMath {

    private CycleMath() {
    }

    /**
     * @param currentDay  1..84, or null when {@code today} is outside the cycle window.
     * @param currentWeek 1..12, or null when outside the window.
     */
    public record Progress(Integer currentDay, Integer currentWeek) {
    }

    public static Progress progress(LocalDate startDate, LocalDate today) {
        long dayIndex = ChronoUnit.DAYS.between(startDate, today); // 0-based
        if (dayIndex < 0 || dayIndex >= Cycle.TOTAL_DAYS) {
            return new Progress(null, null);
        }
        int currentDay = (int) dayIndex + 1;
        int currentWeek = (int) (dayIndex / 7) + 1;
        return new Progress(currentDay, currentWeek);
    }

    /** currentValue / targetValue as an integer percent, capped at 100. */
    public static int progressPercent(int currentValue, int targetValue) {
        if (targetValue <= 0) {
            return 0;
        }
        int percent = (int) Math.round((currentValue * 100.0) / targetValue);
        return Math.min(100, Math.max(0, percent));
    }
}
