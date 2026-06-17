package com.twelveweekyear.feature.analytics.service;

import com.twelveweekyear.feature.analytics.dto.AnalyticsResponse;
import com.twelveweekyear.feature.analytics.support.AnalyticsCalculator;
import com.twelveweekyear.feature.habit.domain.Habit;
import com.twelveweekyear.feature.habit.domain.HabitCompletion;
import com.twelveweekyear.feature.habit.repository.HabitCompletionRepository;
import com.twelveweekyear.feature.habit.repository.HabitRepository;
import com.twelveweekyear.feature.user.service.UserTimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Builds overall habit analytics by summing completions across all of the user's habits per day,
 * then delegating to the pure {@link AnalyticsCalculator}.
 */
@Service
public class AnalyticsService {

    /** Heatmap / weekday window: the trailing year (inclusive of today). */
    private static final int WINDOW_DAYS = 365;

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;
    private final UserTimeService userTimeService;

    public AnalyticsService(HabitRepository habitRepository,
                            HabitCompletionRepository completionRepository,
                            UserTimeService userTimeService) {
        this.habitRepository = habitRepository;
        this.completionRepository = completionRepository;
        this.userTimeService = userTimeService;
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(UUID userId) {
        LocalDate today = userTimeService.today(userId);
        LocalDate windowStart = today.minusDays(WINDOW_DAYS - 1L);

        List<UUID> habitIds = habitRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(Habit::getId)
                .toList();

        // Count completions per calendar day across all habits (a day with 2 habits done = count 2).
        Map<LocalDate, Integer> countsByDate = completionRepository.findByHabitIdIn(habitIds).stream()
                .collect(Collectors.groupingBy(
                        HabitCompletion::getCompletionDate,
                        Collectors.summingInt(c -> 1)));

        return AnalyticsCalculator.compute(today, windowStart, countsByDate);
    }
}
