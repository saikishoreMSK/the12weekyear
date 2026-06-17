package com.twelveweekyear.feature.analytics.support;

import com.twelveweekyear.feature.analytics.dto.AnalyticsResponse;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class AnalyticsCalculatorTest {

    // 2026-06-16 is a Tuesday.
    private static final LocalDate TODAY = LocalDate.of(2026, 6, 16);
    private static final LocalDate WINDOW_START = TODAY.minusDays(364);

    private static Map<LocalDate, Integer> counts(Map<LocalDate, Integer> m) {
        return new HashMap<>(m);
    }

    @Test
    void emptyDataIsAllZeroAndNoBestWorst() {
        AnalyticsResponse r = AnalyticsCalculator.compute(TODAY, WINDOW_START, counts(Map.of()));
        assertThat(r.currentStreak()).isZero();
        assertThat(r.longestStreak()).isZero();
        assertThat(r.totalCompletions()).isZero();
        assertThat(r.bestDayOfWeek()).isNull();
        assertThat(r.worstDayOfWeek()).isNull();
        assertThat(r.heatmap()).isEmpty();
        assertThat(r.weekdayCounts()).hasSize(7);
    }

    @Test
    void aggregatesTotalsStreakAndHeatmap() {
        Map<LocalDate, Integer> data = counts(Map.of(
                TODAY, 3,                 // Tue
                TODAY.minusDays(1), 2,    // Mon
                TODAY.minusDays(2), 1));  // Sun
        AnalyticsResponse r = AnalyticsCalculator.compute(TODAY, WINDOW_START, data);

        assertThat(r.totalCompletions()).isEqualTo(6);
        assertThat(r.activeDays()).isEqualTo(3);
        assertThat(r.currentStreak()).isEqualTo(3);
        assertThat(r.longestStreak()).isEqualTo(3);
        assertThat(r.heatmap()).hasSize(3);
    }

    @Test
    void picksBusiestAndQuietestWeekday() {
        // Two Tuesdays (today + 7 ago) with weight, one Monday with less.
        Map<LocalDate, Integer> data = counts(Map.of(
                TODAY, 3,                 // Tuesday
                TODAY.minusDays(7), 4,    // Tuesday
                TODAY.minusDays(1), 1));  // Monday
        AnalyticsResponse r = AnalyticsCalculator.compute(TODAY, WINDOW_START, data);

        assertThat(r.bestDayOfWeek()).isEqualTo("TUESDAY"); // 7 total
        // Worst is the first weekday with the minimum (0) count, i.e. WEDNESDAY in Mon..Sun order.
        assertThat(r.worstDayOfWeek()).isEqualTo("WEDNESDAY");
    }

    @Test
    void excludesDatesOutsideTheWindowFromHeatmap() {
        Map<LocalDate, Integer> data = counts(Map.of(
                TODAY, 1,
                WINDOW_START.minusDays(5), 9)); // before the window
        AnalyticsResponse r = AnalyticsCalculator.compute(TODAY, WINDOW_START, data);

        assertThat(r.heatmap()).hasSize(1);
        assertThat(r.totalCompletions()).isEqualTo(10); // totals are all-time
    }
}
