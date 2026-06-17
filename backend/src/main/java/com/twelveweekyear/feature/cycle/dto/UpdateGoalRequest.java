package com.twelveweekyear.feature.cycle.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * Partial update: every field is optional and only provided (non-null) fields are applied. This
 * lets the client send just {@code currentValue} to record progress, or any subset to edit.
 */
public record UpdateGoalRequest(
        @Size(max = 50) String category,
        @Size(max = 120) String title,
        @Size(max = 30) String unit,
        @Min(1) Integer targetValue,
        @Min(0) Integer currentValue,
        @Min(1) @Max(12) Integer weekStart,
        @Min(1) @Max(12) Integer weekEnd
) {
}
