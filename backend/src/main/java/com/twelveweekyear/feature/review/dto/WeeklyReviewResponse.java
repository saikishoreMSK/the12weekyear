package com.twelveweekyear.feature.review.dto;

import java.time.Instant;
import java.util.UUID;

public record WeeklyReviewResponse(
        UUID id,
        int weekNumber,
        String wentWell,
        String wastedTime,
        String biggestWin,
        String biggestBlocker,
        Instant createdAt,
        Instant updatedAt
) {
}
