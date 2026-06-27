package com.twelveweekyear.feature.quarter.dto;

import com.twelveweekyear.feature.quarter.domain.QuarterState;

import java.util.UUID;

/**
 * One cell of the 2×2 year dashboard. {@code planned} is false for a quarter the user hasn't set up
 * yet (then {@code quarterId}/{@code score} are null and the UI shows a "Plan" CTA).
 */
public record QuarterTile(
        int quarterNumber,
        String label,
        QuarterState state,
        boolean planned,
        UUID quarterId,
        String title,
        Integer score,
        Integer currentDay,
        int totalDays,
        long goalCount
) {
}
