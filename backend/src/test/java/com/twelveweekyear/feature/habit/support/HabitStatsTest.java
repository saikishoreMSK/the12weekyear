package com.twelveweekyear.feature.habit.support;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class HabitStatsTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 6, 16);

    private static Set<LocalDate> days(int... daysAgo) {
        return java.util.Arrays.stream(daysAgo)
                .mapToObj(d -> TODAY.minusDays(d))
                .collect(java.util.stream.Collectors.toSet());
    }

    @Test
    void emptyHistoryHasNoStreak() {
        HabitStats.Stats s = HabitStats.compute(TODAY, TODAY, Set.of());
        assertThat(s.currentStreak()).isZero();
        assertThat(s.longestStreak()).isZero();
        assertThat(s.completedToday()).isFalse();
        assertThat(s.totalCompletions()).isZero();
    }

    @Test
    void currentStreakCountsThroughToday() {
        // today, yesterday, 2 days ago completed
        HabitStats.Stats s = HabitStats.compute(TODAY.minusDays(2), TODAY, days(0, 1, 2));
        assertThat(s.currentStreak()).isEqualTo(3);
        assertThat(s.completedToday()).isTrue();
    }

    @Test
    void streakStaysAliveWhenTodayNotYetDoneButYesterdayWas() {
        HabitStats.Stats s = HabitStats.compute(TODAY.minusDays(2), TODAY, days(1, 2));
        assertThat(s.currentStreak()).isEqualTo(2); // counts yesterday + 2-days-ago
        assertThat(s.completedToday()).isFalse();
    }

    @Test
    void streakBreaksWhenNeitherTodayNorYesterdayDone() {
        HabitStats.Stats s = HabitStats.compute(TODAY.minusDays(5), TODAY, days(2, 3, 4));
        assertThat(s.currentStreak()).isZero();
        assertThat(s.longestStreak()).isEqualTo(3);
    }

    @Test
    void longestStreakFindsTheBestRun() {
        // a run of 4 (10..7 ago) and a run of 2 (1..0 ago)
        HabitStats.Stats s = HabitStats.compute(TODAY.minusDays(20), TODAY, days(10, 9, 8, 7, 1, 0));
        assertThat(s.longestStreak()).isEqualTo(4);
        assertThat(s.currentStreak()).isEqualTo(2);
    }

    @Test
    void completionRateIsCompletedDaysOverElapsedDays() {
        // start 9 days ago -> 10 elapsed days inclusive; 5 completed -> 50%
        HabitStats.Stats s = HabitStats.compute(TODAY.minusDays(9), TODAY, days(0, 1, 2, 3, 4));
        assertThat(s.completionRate()).isEqualTo(50);
    }
}
