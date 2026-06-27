package com.twelveweekyear.feature.quarter.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/** Partial update: only non-null fields are applied (e.g. send just {@code currentValue}). */
public record UpdateGoalRequest(
        @Size(max = 50) String category,
        @Size(max = 120) String title,
        @Size(max = 30) String unit,
        @Min(1) Integer targetValue,
        @Min(0) Integer currentValue,
        @Min(1) @Max(13) Integer weekStart,
        @Min(1) @Max(13) Integer weekEnd
) {
}
