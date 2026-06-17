package com.twelveweekyear.feature.review.dto;

import jakarta.validation.constraints.Size;

/** The four weekly-review prompts. All optional; the week number comes from the path. */
public record WeeklyReviewRequest(
        @Size(max = 2000) String wentWell,
        @Size(max = 2000) String wastedTime,
        @Size(max = 2000) String biggestWin,
        @Size(max = 2000) String biggestBlocker
) {
}
