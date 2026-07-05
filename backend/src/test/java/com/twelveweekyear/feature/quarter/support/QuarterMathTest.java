package com.twelveweekyear.feature.quarter.support;

import com.twelveweekyear.feature.quarter.domain.QuarterState;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class QuarterMathTest {

    @Test
    void boundsCoverEachCalendarQuarter() {
        assertThat(QuarterMath.bounds(2026, 1).start()).isEqualTo(LocalDate.of(2026, 1, 1));
        assertThat(QuarterMath.bounds(2026, 1).end()).isEqualTo(LocalDate.of(2026, 3, 31));
        assertThat(QuarterMath.bounds(2026, 4).end()).isEqualTo(LocalDate.of(2026, 12, 31));
    }

    @Test
    void q1IsLeapYearAware() {
        assertThat(QuarterMath.bounds(2024, 1).totalDays()).isEqualTo(91); // 2024 leap: Jan31+Feb29+Mar31
        assertThat(QuarterMath.bounds(2026, 1).totalDays()).isEqualTo(90); // non-leap: 31+28+31
    }

    @Test
    void stateAndDayDependOnToday() {
        // Q2 2026 = Apr 1 – Jun 30.
        QuarterMath.Progress before = QuarterMath.progress(2026, 2, LocalDate.of(2026, 3, 31));
        assertThat(before.state()).isEqualTo(QuarterState.UPCOMING);
        assertThat(before.currentDay()).isNull();

        QuarterMath.Progress day1 = QuarterMath.progress(2026, 2, LocalDate.of(2026, 4, 1));
        assertThat(day1.state()).isEqualTo(QuarterState.ACTIVE);
        assertThat(day1.currentDay()).isEqualTo(1);
        assertThat(day1.currentWeek()).isEqualTo(1);

        QuarterMath.Progress day8 = QuarterMath.progress(2026, 2, LocalDate.of(2026, 4, 8));
        assertThat(day8.currentWeek()).isEqualTo(2);

        QuarterMath.Progress after = QuarterMath.progress(2026, 2, LocalDate.of(2026, 7, 1));
        assertThat(after.state()).isEqualTo(QuarterState.COMPLETED);
        assertThat(after.currentDay()).isNull();
    }
}
