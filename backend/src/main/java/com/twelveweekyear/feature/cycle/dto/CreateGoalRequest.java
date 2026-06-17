package com.twelveweekyear.feature.cycle.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Week range is optional — when omitted it spans the whole cycle (1..12). {@code weekEnd >=
 * weekStart} is enforced in the service.
 */
public record CreateGoalRequest(
        @NotBlank @Size(max = 50) String category,
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 30) String unit,
        @NotNull @Min(1) Integer targetValue,
        @Min(1) @Max(12) Integer weekStart,
        @Min(1) @Max(12) Integer weekEnd
) {
}
