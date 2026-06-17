package com.twelveweekyear.feature.cycle.dto;

import java.util.UUID;

public record GoalResponse(
        UUID id,
        String category,
        String title,
        String unit,
        int targetValue,
        int currentValue,
        /** currentValue / targetValue, capped at 100 for display. */
        int progressPercent,
        int weekStart,
        int weekEnd
) {
}
