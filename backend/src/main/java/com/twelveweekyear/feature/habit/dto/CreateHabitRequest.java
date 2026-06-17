package com.twelveweekyear.feature.habit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** {@code startDate} is optional; when omitted the habit starts today (in the user's timezone). */
public record CreateHabitRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 280) String description,
        @Size(max = 9) String color,
        LocalDate startDate
) {
}
