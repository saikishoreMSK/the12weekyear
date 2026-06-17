package com.twelveweekyear.feature.dashboard.service;

import com.twelveweekyear.feature.cycle.dto.CycleResponse;
import com.twelveweekyear.feature.cycle.dto.GoalResponse;
import com.twelveweekyear.feature.cycle.service.CycleService;
import com.twelveweekyear.feature.dashboard.dto.DashboardHabit;
import com.twelveweekyear.feature.dashboard.dto.DashboardResponse;
import com.twelveweekyear.feature.dashboard.support.SprintScore;
import com.twelveweekyear.feature.habit.domain.Habit;
import com.twelveweekyear.feature.habit.domain.HabitCompletion;
import com.twelveweekyear.feature.habit.repository.HabitCompletionRepository;
import com.twelveweekyear.feature.habit.repository.HabitRepository;
import com.twelveweekyear.feature.habit.support.HabitStats;
import com.twelveweekyear.feature.user.service.UserTimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Composes the sprint dashboard from the current cycle (reused from {@link CycleService}) and the
 * user's habits, then computes the Sprint Score. Read-only aggregation — owns no entities.
 */
@Service
public class DashboardService {

    private final CycleService cycleService;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;
    private final UserTimeService userTimeService;

    public DashboardService(CycleService cycleService,
                            HabitRepository habitRepository,
                            HabitCompletionRepository completionRepository,
                            UserTimeService userTimeService) {
        this.cycleService = cycleService;
        this.habitRepository = habitRepository;
        this.completionRepository = completionRepository;
        this.userTimeService = userTimeService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UUID userId) {
        // Throws 404 when there is no active cycle; the client renders a "create a cycle" prompt.
        CycleResponse cycle = cycleService.getCurrent(userId);
        LocalDate today = userTimeService.today(userId);

        Integer goalsProgress = cycle.goals().isEmpty()
                ? null
                : SprintScore.average(cycle.goals().stream().map(GoalResponse::progressPercent).toList());

        List<Habit> habits = habitRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .filter(Habit::isActive)
                .toList();
        Map<UUID, Set<LocalDate>> byHabit = completionRepository
                .findByHabitIdIn(habits.stream().map(Habit::getId).toList()).stream()
                .collect(Collectors.groupingBy(
                        HabitCompletion::getHabitId,
                        Collectors.mapping(HabitCompletion::getCompletionDate, Collectors.toSet())));

        List<DashboardHabit> dashboardHabits = new ArrayList<>();
        List<Integer> sprintRates = new ArrayList<>();
        for (Habit habit : habits) {
            Set<LocalDate> completions = byHabit.getOrDefault(habit.getId(), Set.of());
            HabitStats.Stats stats = HabitStats.compute(habit.getStartDate(), today, completions);
            int sprintRate = sprintCompletionRate(cycle.startDate(), habit.getStartDate(), today, completions);
            sprintRates.add(sprintRate);
            dashboardHabits.add(new DashboardHabit(
                    habit.getId(), habit.getName(), stats.currentStreak(), stats.completedToday(), sprintRate));
        }

        Integer habitsConsistency = habits.isEmpty() ? null : SprintScore.average(sprintRates);
        int sprintScore = SprintScore.combine(goalsProgress, habitsConsistency);

        return new DashboardResponse(
                cycle.id(), cycle.title(), cycle.status(),
                cycle.startDate(), cycle.endDate(), cycle.totalDays(), cycle.totalWeeks(),
                cycle.currentDay(), cycle.currentWeek(),
                sprintScore,
                goalsProgress != null ? goalsProgress : 0,
                habitsConsistency != null ? habitsConsistency : 0,
                cycle.goals(), dashboardHabits);
    }

    /** Completion rate over the part of the sprint elapsed so far for this habit. */
    private int sprintCompletionRate(LocalDate cycleStart, LocalDate habitStart, LocalDate today,
                                     Set<LocalDate> completions) {
        LocalDate windowStart = cycleStart.isAfter(habitStart) ? cycleStart : habitStart;
        if (today.isBefore(windowStart)) {
            return 0;
        }
        long windowDays = ChronoUnit.DAYS.between(windowStart, today) + 1;
        long done = completions.stream()
                .filter(d -> !d.isBefore(windowStart) && !d.isAfter(today))
                .count();
        return (int) Math.min(100, Math.round((done * 100.0) / windowDays));
    }
}
