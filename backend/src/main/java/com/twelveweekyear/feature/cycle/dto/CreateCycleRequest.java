package com.twelveweekyear.feature.cycle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateCycleRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 2000) String objective,
        @NotNull LocalDate startDate
) {
}
