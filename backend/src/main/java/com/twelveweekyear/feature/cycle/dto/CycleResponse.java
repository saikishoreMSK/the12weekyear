package com.twelveweekyear.feature.cycle.dto;

import com.twelveweekyear.feature.cycle.domain.CycleStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Full cycle detail. {@code currentDay}/{@code currentWeek} are null when today falls outside the
 * cycle's 84-day window (not started yet, or already finished).
 */
public record CycleResponse(
        UUID id,
        String title,
        String objective,
        CycleStatus status,
        LocalDate startDate,
        LocalDate endDate,
        int totalDays,
        int totalWeeks,
        Integer currentDay,
        Integer currentWeek,
        List<GoalResponse> goals
) {
}
