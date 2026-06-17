package com.twelveweekyear.feature.cycle.dto;

import com.twelveweekyear.feature.cycle.domain.CycleStatus;

import java.time.LocalDate;
import java.util.UUID;

/** Lightweight projection for cycle lists. */
public record CycleSummaryResponse(
        UUID id,
        String title,
        CycleStatus status,
        LocalDate startDate,
        LocalDate endDate,
        Integer currentDay,
        Integer currentWeek,
        int totalDays,
        long goalCount
) {
}
