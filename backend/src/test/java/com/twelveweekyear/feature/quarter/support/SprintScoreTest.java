package com.twelveweekyear.feature.quarter.support;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SprintScoreTest {

    @Test
    void averageRoundsToNearestInt() {
        assertThat(SprintScore.average(List.of(10, 28, 30, 40))).isEqualTo(27);
        assertThat(SprintScore.average(List.of(1, 2))).isEqualTo(2);
        assertThat(SprintScore.average(List.of())).isZero();
    }

    @Test
    void combineUsesOnlyPresentDimensions() {
        assertThat(SprintScore.combine(80, 60)).isEqualTo(70);
        assertThat(SprintScore.combine(75, null)).isEqualTo(75);
        assertThat(SprintScore.combine(null, 40)).isEqualTo(40);
        assertThat(SprintScore.combine(null, null)).isZero();
    }
}
