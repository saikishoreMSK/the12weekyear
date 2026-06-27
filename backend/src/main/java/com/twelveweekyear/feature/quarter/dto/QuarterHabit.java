package com.twelveweekyear.feature.quarter.dto;

import java.util.UUID;

/** A habit shown on the quarter's execution view: streak, today's state, and this-quarter consistency. */
public record QuarterHabit(
        UUID id,
        String name,
        int currentStreak,
        boolean completedToday,
        int completionRate
) {
}
