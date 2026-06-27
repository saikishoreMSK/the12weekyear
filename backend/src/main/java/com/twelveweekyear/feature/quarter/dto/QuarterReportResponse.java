package com.twelveweekyear.feature.quarter.dto;

import java.util.List;
import java.util.UUID;

/** End-of-quarter summary: the final score, how each goal landed, habit highlights, and reviews done. */
public record QuarterReportResponse(
        UUID id,
        int year,
        int quarterNumber,
        String label,
        String title,
        String objective,
        int sprintScore,
        int goalsProgress,
        int habitsConsistency,
        List<GoalOutcome> goals,
        List<HabitHighlight> habits,
        int reviewsCompleted,
        int totalWeeks
) {

    /** A goal's final standing. {@code met} is true when target was reached. */
    public record GoalOutcome(
            String category,
            String title,
            int currentValue,
            int targetValue,
            String unit,
            int progressPercent,
            boolean met
    ) {
    }

    /** A habit's performance within this quarter's window. */
    public record HabitHighlight(
            String name,
            int completionRate,
            int longestStreak
    ) {
    }
}
