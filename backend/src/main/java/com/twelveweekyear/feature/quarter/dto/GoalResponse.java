package com.twelveweekyear.feature.quarter.dto;

import com.twelveweekyear.feature.quarter.domain.GoalPace;

import java.util.UUID;

public record GoalResponse(
        UUID id,
        String category,
        String title,
        String unit,
        int targetValue,
        int currentValue,
        int progressPercent,
        int weekStart,
        int weekEnd,
        /** AHEAD / ON_TRACK / BEHIND vs. time elapsed — null unless the quarter is active. */
        GoalPace pace
) {
}
