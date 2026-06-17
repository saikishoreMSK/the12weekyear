package com.twelveweekyear.feature.dashboard.dto;

import com.twelveweekyear.feature.cycle.domain.CycleStatus;
import com.twelveweekyear.feature.cycle.dto.GoalResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * The sprint dashboard payload: the current cycle, its goals, the user's habits, and the computed
 * Sprint Score (with its two component dimensions surfaced for the UI).
 */
public record DashboardResponse(
        UUID cycleId,
        String cycleTitle,
        CycleStatus status,
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
        List<DashboardHabit> habits
) {
}
