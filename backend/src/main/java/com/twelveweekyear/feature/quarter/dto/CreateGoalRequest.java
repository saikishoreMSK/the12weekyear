package com.twelveweekyear.feature.quarter.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** A weekly goal: a title and the week it belongs to. */
public record CreateGoalRequest(
        @NotBlank @Size(max = 120) String title,
        @NotNull @Min(1) @Max(13) Integer week
) {
}
