package com.twelveweekyear.feature.quarter.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateQuarterRequest(
        @NotNull @Min(2000) @Max(2100) Integer year,
        @NotNull @Min(1) @Max(4) Integer quarterNumber,
        @Size(max = 120) String title,
        @Size(max = 2000) String objective
) {
}
