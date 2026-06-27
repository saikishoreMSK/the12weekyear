package com.twelveweekyear.feature.quarter.dto;

import com.twelveweekyear.feature.quarter.domain.QuarterState;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Full execution view of a quarter: its calendar info, goals (with pacing), the quarter score and
 * its two component dimensions, and the user's habits for daily ticking. {@code currentDay}/
 * {@code currentWeek} are null unless the quarter is currently active.
 */
public record QuarterResponse(
        UUID id,
        int year,
        int quarterNumber,
        String label,
        String title,
        String objective,
        QuarterState state,
        LocalDate startDate,
        LocalDate endDate,
        int totalDays,
        int totalWeeks,
        Integer currentDay,
        Integer currentWeek,
        int sprintScore,
        int goalsProgress,
        int habitsConsistency,
        List<GoalResponse> goals,
        List<QuarterHabit> habits
) {
}
