package com.twelveweekyear.feature.quarter.dto;

import com.twelveweekyear.feature.quarter.domain.GoalStatus;

import java.util.UUID;

public record GoalResponse(
        UUID id,
        String title,
        int week,
        boolean done,
        /** DONE / THIS_WEEK / UPCOMING / MISSED relative to today. */
        GoalStatus status
) {
}
