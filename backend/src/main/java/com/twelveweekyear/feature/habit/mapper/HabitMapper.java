package com.twelveweekyear.feature.habit.mapper;

import com.twelveweekyear.feature.habit.domain.Habit;
import com.twelveweekyear.feature.habit.dto.HabitResponse;
import com.twelveweekyear.feature.habit.support.HabitStats;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/** Builds {@link HabitResponse}, computing stats and trimming returned dates to a recent window. */
@Component
public class HabitMapper {

    /** Roughly one year of history is returned for display; stats use the full set. */
    private static final int RECENT_WINDOW_DAYS = 366;

    public HabitResponse toResponse(Habit habit, Set<LocalDate> completions, LocalDate today) {
        HabitStats.Stats stats = HabitStats.compute(habit.getStartDate(), today, completions);

        LocalDate windowStart = today.minusDays(RECENT_WINDOW_DAYS);
        List<LocalDate> recentDates = completions.stream()
                .filter(date -> !date.isBefore(windowStart))
                .sorted()
                .toList();

        return new HabitResponse(
                habit.getId(),
                habit.getName(),
                habit.getDescription(),
                habit.getColor(),
                habit.getStartDate(),
                habit.isActive(),
                stats.completedToday(),
                stats.currentStreak(),
                stats.longestStreak(),
                stats.completionRate(),
                stats.totalCompletions(),
                recentDates);
    }
}
