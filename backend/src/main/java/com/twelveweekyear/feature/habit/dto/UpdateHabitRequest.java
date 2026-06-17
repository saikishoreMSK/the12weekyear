package com.twelveweekyear.feature.habit.dto;

import jakarta.validation.constraints.Size;

/** Partial update — only non-null fields are applied. */
public record UpdateHabitRequest(
        @Size(max = 100) String name,
        @Size(max = 280) String description,
        @Size(max = 9) String color,
        Boolean active
) {
}
