package com.twelveweekyear.feature.quarter.support;

import com.twelveweekyear.feature.quarter.domain.QuarterState;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/** Calendar math for quarters: bounds, day/week-of-quarter, and state. Pure & tested. */
public final class QuarterMath {

    private QuarterMath() {
    }

    public record Bounds(LocalDate start, LocalDate end, int totalDays) {
    }

    /**
     * @param state       UPCOMING / ACTIVE / COMPLETED relative to {@code today}.
     * @param currentDay  1..totalDays while ACTIVE, otherwise null.
     * @param currentWeek 1..totalWeeks while ACTIVE, otherwise null.
     */
    public record Progress(QuarterState state, Integer currentDay, Integer currentWeek,
                           int totalDays, int totalWeeks) {
    }

    /** Calendar bounds of a quarter (Q1=Jan–Mar … Q4=Oct–Dec), leap-year aware. */
    public static Bounds bounds(int year, int quarterNumber) {
        int startMonth = (quarterNumber - 1) * 3 + 1;
        LocalDate start = LocalDate.of(year, startMonth, 1);
        LocalDate end = start.plusMonths(3).minusDays(1);
        int totalDays = (int) ChronoUnit.DAYS.between(start, end) + 1;
        return new Bounds(start, end, totalDays);
    }

    public static int totalWeeks(int totalDays) {
        return (int) Math.ceil(totalDays / 7.0);
    }

    public static Progress progress(int year, int quarterNumber, LocalDate today) {
        Bounds b = bounds(year, quarterNumber);
        int totalWeeks = totalWeeks(b.totalDays());

        if (today.isBefore(b.start())) {
            return new Progress(QuarterState.UPCOMING, null, null, b.totalDays(), totalWeeks);
        }
        if (today.isAfter(b.end())) {
            return new Progress(QuarterState.COMPLETED, null, null, b.totalDays(), totalWeeks);
        }
        long dayIndex = ChronoUnit.DAYS.between(b.start(), today); // 0-based
        int currentDay = (int) dayIndex + 1;
        int currentWeek = (int) (dayIndex / 7) + 1;
        return new Progress(QuarterState.ACTIVE, currentDay, currentWeek, b.totalDays(), totalWeeks);
    }
}
