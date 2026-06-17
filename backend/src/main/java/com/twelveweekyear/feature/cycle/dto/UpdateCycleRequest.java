package com.twelveweekyear.feature.cycle.dto;

import com.twelveweekyear.feature.cycle.domain.CycleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateCycleRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 2000) String objective,
        @NotNull CycleStatus status
) {
}
