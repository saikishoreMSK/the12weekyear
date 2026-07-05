package com.twelveweekyear.feature.quarter.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/** Partial update: only non-null fields are applied (e.g. send just {@code done} to check it off). */
public record UpdateGoalRequest(
        @Size(max = 120) String title,
        @Min(1) @Max(13) Integer week,
        Boolean done
) {
}
