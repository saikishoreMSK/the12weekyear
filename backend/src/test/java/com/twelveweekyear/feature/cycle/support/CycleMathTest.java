package com.twelveweekyear.feature.cycle.support;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class CycleMathTest {

    private static final LocalDate START = LocalDate.of(2026, 1, 1);

    @Test
    void dayOneIsTheStartDate() {
        CycleMath.Progress p = CycleMath.progress(START, START);
        assertThat(p.currentDay()).isEqualTo(1);
        assertThat(p.currentWeek()).isEqualTo(1);
    }

    @Test
    void weekBoundariesAreCorrect() {
        assertThat(CycleMath.progress(START, START.plusDays(6)).currentWeek()).isEqualTo(1); // day 7
        assertThat(CycleMath.progress(START, START.plusDays(7)).currentWeek()).isEqualTo(2); // day 8
        assertThat(CycleMath.progress(START, START.plusDays(83)).currentDay()).isEqualTo(84); // last day
        assertThat(CycleMath.progress(START, START.plusDays(83)).currentWeek()).isEqualTo(12);
    }

    @Test
    void outsideTheWindowYieldsNull() {
        assertThat(CycleMath.progress(START, START.minusDays(1)).currentDay()).isNull(); // before start
        assertThat(CycleMath.progress(START, START.plusDays(84)).currentDay()).isNull(); // day 85
    }

    @Test
    void progressPercentClampsAndRounds() {
        assertThat(CycleMath.progressPercent(0, 28)).isZero();
        assertThat(CycleMath.progressPercent(14, 28)).isEqualTo(50);
        assertThat(CycleMath.progressPercent(28, 28)).isEqualTo(100);
        assertThat(CycleMath.progressPercent(40, 28)).isEqualTo(100); // capped
        assertThat(CycleMath.progressPercent(5, 0)).isZero();         // guard against /0
    }
}
