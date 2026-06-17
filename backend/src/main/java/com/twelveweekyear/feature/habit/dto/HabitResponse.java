package com.twelveweekyear.feature.habit.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * A habit with its derived stats. {@code completionDates} lists completed days within the recent
 * window (last ~year), enough for the detail grid and the future heatmap; streak/longest are
 * computed from the full history server-side.
 */
public record HabitResponse(
        UUID id,
        String name,
        String description,
        String color,
        LocalDate startDate,
        boolean active,
        boolean completedToday,
        int currentStreak,
        int longestStreak,
        int completionRate,
        int totalCompletions,
        List<LocalDate> completionDates
) {
}
