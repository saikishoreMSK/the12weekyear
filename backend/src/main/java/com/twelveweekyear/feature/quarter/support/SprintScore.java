package com.twelveweekyear.feature.quarter.support;

import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * The quarter score blends the dimensions that have data. A dimension passed as {@code null} (no
 * goals, or no habits) is excluded so it doesn't drag the score to zero — a goals-only or
 * habits-only user still gets a meaningful number.
 */
public final class SprintScore {

    private SprintScore() {
    }

    /** Mean of the values as an integer percent; 0 for an empty list. */
    public static int average(List<Integer> values) {
        if (values.isEmpty()) {
            return 0;
        }
        return (int) Math.round(values.stream().mapToInt(Integer::intValue).average().orElse(0));
    }

    /** Equal-weighted mean of the present (non-null) dimensions; 0 when none are present. */
    public static int combine(Integer goalsProgress, Integer habitsConsistency) {
        List<Integer> present = Stream.of(goalsProgress, habitsConsistency)
                .filter(Objects::nonNull)
                .toList();
        return average(present);
    }
}
