package com.twelveweekyear.feature.quarter.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.common.exception.ResourceNotFoundException;
import com.twelveweekyear.feature.habit.domain.Habit;
import com.twelveweekyear.feature.habit.domain.HabitCompletion;
import com.twelveweekyear.feature.habit.repository.HabitCompletionRepository;
import com.twelveweekyear.feature.habit.repository.HabitRepository;
import com.twelveweekyear.feature.habit.support.Streaks;
import com.twelveweekyear.feature.quarter.domain.Goal;
import com.twelveweekyear.feature.quarter.domain.Quarter;
import com.twelveweekyear.feature.quarter.domain.QuarterState;
import com.twelveweekyear.feature.quarter.dto.CreateQuarterRequest;
import com.twelveweekyear.feature.quarter.dto.GoalResponse;
import com.twelveweekyear.feature.quarter.dto.QuarterHabit;
import com.twelveweekyear.feature.quarter.dto.QuarterReportResponse;
import com.twelveweekyear.feature.quarter.dto.QuarterResponse;
import com.twelveweekyear.feature.quarter.dto.QuarterTile;
import com.twelveweekyear.feature.quarter.dto.UpdateQuarterRequest;
import com.twelveweekyear.feature.quarter.dto.YearDashboardResponse;
import com.twelveweekyear.feature.quarter.mapper.QuarterMapper;
import com.twelveweekyear.feature.quarter.repository.GoalRepository;
import com.twelveweekyear.feature.quarter.repository.QuarterRepository;
import com.twelveweekyear.feature.quarter.support.QuarterMath;
import com.twelveweekyear.feature.quarter.support.SprintScore;
import com.twelveweekyear.feature.review.repository.WeeklyReviewRepository;
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
 * The quarter hub: CRUD, the per-quarter execution view (goals + pacing + score + habits), the
 * 2×2 year dashboard, and the end-of-quarter report. All operations are scoped to the owner.
 */
@Service
public class QuarterService {

    private final QuarterRepository quarterRepository;
    private final GoalRepository goalRepository;
    private final WeeklyReviewRepository reviewRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;
    private final UserTimeService userTimeService;
    private final QuarterMapper quarterMapper;

    public QuarterService(QuarterRepository quarterRepository,
                          GoalRepository goalRepository,
                          WeeklyReviewRepository reviewRepository,
                          HabitRepository habitRepository,
                          HabitCompletionRepository completionRepository,
                          UserTimeService userTimeService,
                          QuarterMapper quarterMapper) {
        this.quarterRepository = quarterRepository;
        this.goalRepository = goalRepository;
        this.reviewRepository = reviewRepository;
        this.habitRepository = habitRepository;
        this.completionRepository = completionRepository;
        this.userTimeService = userTimeService;
        this.quarterMapper = quarterMapper;
    }

    // ---- CRUD ----

    @Transactional
    public QuarterResponse create(UUID userId, CreateQuarterRequest request) {
        if (quarterRepository.existsByUserIdAndYearAndQuarterNumber(
                userId, request.year(), request.quarterNumber())) {
            throw new AppException(ErrorCode.CONFLICT, "That quarter is already planned");
        }
        Quarter quarter = new Quarter();
        quarter.setUserId(userId);
        quarter.setYear(request.year());
        quarter.setQuarterNumber(request.quarterNumber());
        quarter.setTitle(blankToNull(request.title()));
        quarter.setObjective(blankToNull(request.objective()));
        quarterRepository.save(quarter);
        return buildDetail(quarter, userTimeService.today(userId));
    }

    @Transactional(readOnly = true)
    public QuarterResponse get(UUID userId, UUID quarterId) {
        Quarter quarter = requireOwnedQuarter(userId, quarterId);
        return buildDetail(quarter, userTimeService.today(userId));
    }

    /** The quarter containing today, if the user has planned it; 404 otherwise. */
    @Transactional(readOnly = true)
    public QuarterResponse getCurrent(UUID userId) {
        LocalDate today = userTimeService.today(userId);
        int quarterNumber = (today.getMonthValue() - 1) / 3 + 1;
        Quarter quarter = quarterRepository
                .findByUserIdAndYearAndQuarterNumber(userId, today.getYear(), quarterNumber)
                .orElseThrow(() -> new ResourceNotFoundException("No quarter planned for the current period"));
        return buildDetail(quarter, today);
    }

    @Transactional
    public QuarterResponse update(UUID userId, UUID quarterId, UpdateQuarterRequest request) {
        Quarter quarter = requireOwnedQuarter(userId, quarterId);
        quarter.setTitle(blankToNull(request.title()));
        quarter.setObjective(blankToNull(request.objective()));
        return buildDetail(quarter, userTimeService.today(userId));
    }

    @Transactional
    public void delete(UUID userId, UUID quarterId) {
        Quarter quarter = requireOwnedQuarter(userId, quarterId);
        goalRepository.deleteByQuarterId(quarter.getId());
        reviewRepository.deleteByQuarterId(quarter.getId());
        quarterRepository.delete(quarter);
    }

    public Quarter requireOwnedQuarter(UUID userId, UUID quarterId) {
        return quarterRepository.findByIdAndUserId(quarterId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Quarter not found"));
    }

    // ---- Year dashboard (2×2 grid) ----

    @Transactional(readOnly = true)
    public YearDashboardResponse getYearDashboard(UUID userId, Integer requestedYear) {
        LocalDate today = userTimeService.today(userId);
        int year = requestedYear != null ? requestedYear : today.getYear();
        HabitData habitData = loadHabits(userId);

        Map<Integer, Quarter> planned = quarterRepository
                .findByUserIdAndYearOrderByQuarterNumberAsc(userId, year).stream()
                .collect(Collectors.toMap(Quarter::getQuarterNumber, q -> q));

        List<QuarterTile> tiles = new ArrayList<>();
        for (int q = 1; q <= 4; q++) {
            QuarterMath.Progress p = QuarterMath.progress(year, q, today);
            QuarterMath.Bounds b = QuarterMath.bounds(year, q);
            Quarter quarter = planned.get(q);
            String label = quarterMapper.label(q);

            if (quarter == null) {
                tiles.add(new QuarterTile(q, label, p.state(), false, null, null, null,
                        p.currentDay(), p.totalDays(), 0));
                continue;
            }

            List<Goal> goals = goalRepository.findByQuarterIdOrderByCategoryAscCreatedAtAsc(quarter.getId());
            Integer goalsProgress = averageGoalProgress(goals);
            boolean started = !today.isBefore(b.start());
            LocalDate windowEnd = today.isAfter(b.end()) ? b.end() : today;
            Integer consistency = consistency(habitData, b.start(), windowEnd, started);
            // No score for a quarter that hasn't started yet.
            Integer score = p.state() == QuarterState.UPCOMING
                    ? null
                    : SprintScore.combine(goalsProgress, consistency);

            tiles.add(new QuarterTile(q, label, p.state(), true, quarter.getId(), quarter.getTitle(),
                    score, p.currentDay(), p.totalDays(), goals.size()));
        }
        return new YearDashboardResponse(year, tiles);
    }

    // ---- End-of-quarter report ----

    @Transactional(readOnly = true)
    public QuarterReportResponse getReport(UUID userId, UUID quarterId) {
        Quarter quarter = requireOwnedQuarter(userId, quarterId);
        LocalDate today = userTimeService.today(userId);
        QuarterMath.Bounds b = QuarterMath.bounds(quarter.getYear(), quarter.getQuarterNumber());
        LocalDate windowEnd = today.isAfter(b.end()) ? b.end() : today;
        boolean started = !today.isBefore(b.start());

        List<Goal> goals = goalRepository.findByQuarterIdOrderByCategoryAscCreatedAtAsc(quarter.getId());
        List<QuarterReportResponse.GoalOutcome> outcomes = goals.stream()
                .map(g -> new QuarterReportResponse.GoalOutcome(
                        g.getCategory(), g.getTitle(), g.getCurrentValue(), g.getTargetValue(), g.getUnit(),
                        QuarterMath.progressPercent(g.getCurrentValue(), g.getTargetValue()),
                        g.getCurrentValue() >= g.getTargetValue()))
                .toList();
        Integer goalsProgress = averageGoalProgress(goals);

        HabitData habitData = loadHabits(userId);
        List<QuarterReportResponse.HabitHighlight> highlights = new ArrayList<>();
        List<Integer> rates = new ArrayList<>();
        for (Habit habit : habitData.habits()) {
            Set<LocalDate> all = habitData.completions().getOrDefault(habit.getId(), Set.of());
            LocalDate effStart = b.start().isAfter(habit.getStartDate()) ? b.start() : habit.getStartDate();
            int rate = started ? rateInWindow(all, effStart, windowEnd) : 0;
            Set<LocalDate> inQuarter = all.stream()
                    .filter(d -> !d.isBefore(b.start()) && !d.isAfter(b.end()))
                    .collect(Collectors.toSet());
            highlights.add(new QuarterReportResponse.HabitHighlight(
                    habit.getName(), rate, Streaks.longest(inQuarter)));
            rates.add(rate);
        }
        Integer consistency = (habitData.habits().isEmpty() || !started) ? null : SprintScore.average(rates);

        return new QuarterReportResponse(
                quarter.getId(), quarter.getYear(), quarter.getQuarterNumber(),
                quarterMapper.label(quarter.getQuarterNumber()), quarter.getTitle(), quarter.getObjective(),
                SprintScore.combine(goalsProgress, consistency),
                goalsProgress != null ? goalsProgress : 0,
                consistency != null ? consistency : 0,
                outcomes, highlights,
                reviewRepository.countByQuarterId(quarter.getId()),
                QuarterMath.totalWeeks(b.totalDays()));
    }

    // ---- Internals ----

    private QuarterResponse buildDetail(Quarter quarter, LocalDate today) {
        QuarterMath.Progress p = QuarterMath.progress(quarter.getYear(), quarter.getQuarterNumber(), today);
        QuarterMath.Bounds b = QuarterMath.bounds(quarter.getYear(), quarter.getQuarterNumber());
        boolean active = p.state() == QuarterState.ACTIVE;

        List<Goal> goals = goalRepository.findByQuarterIdOrderByCategoryAscCreatedAtAsc(quarter.getId());
        List<GoalResponse> goalResponses = goals.stream()
                .map(g -> quarterMapper.toGoalResponse(
                        g, active, active ? p.currentDay() : 0, p.totalDays()))
                .toList();
        Integer goalsProgress = averageGoalProgress(goals);

        boolean started = !today.isBefore(b.start());
        LocalDate windowEnd = today.isAfter(b.end()) ? b.end() : today;
        HabitData habitData = loadHabits(quarter.getUserId());
        List<QuarterHabit> habits = quarterHabits(habitData, today, b.start(), windowEnd, started);
        Integer consistency = consistency(habitData, b.start(), windowEnd, started);

        return new QuarterResponse(
                quarter.getId(), quarter.getYear(), quarter.getQuarterNumber(),
                quarterMapper.label(quarter.getQuarterNumber()), quarter.getTitle(), quarter.getObjective(),
                p.state(), b.start(), b.end(), p.totalDays(), p.totalWeeks(), p.currentDay(), p.currentWeek(),
                SprintScore.combine(goalsProgress, consistency),
                goalsProgress != null ? goalsProgress : 0,
                consistency != null ? consistency : 0,
                goalResponses, habits);
    }

    private record HabitData(List<Habit> habits, Map<UUID, Set<LocalDate>> completions) {
    }

    private HabitData loadHabits(UUID userId) {
        List<Habit> habits = habitRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .filter(Habit::isActive)
                .toList();
        Map<UUID, Set<LocalDate>> completions = completionRepository
                .findByHabitIdIn(habits.stream().map(Habit::getId).toList()).stream()
                .collect(Collectors.groupingBy(
                        HabitCompletion::getHabitId,
                        Collectors.mapping(HabitCompletion::getCompletionDate, Collectors.toSet())));
        return new HabitData(habits, completions);
    }

    private List<QuarterHabit> quarterHabits(HabitData data, LocalDate today,
                                             LocalDate windowStart, LocalDate windowEnd, boolean started) {
        List<QuarterHabit> result = new ArrayList<>();
        for (Habit habit : data.habits()) {
            Set<LocalDate> comps = data.completions().getOrDefault(habit.getId(), Set.of());
            LocalDate effStart = windowStart.isAfter(habit.getStartDate()) ? windowStart : habit.getStartDate();
            int rate = started ? rateInWindow(comps, effStart, windowEnd) : 0;
            result.add(new QuarterHabit(
                    habit.getId(), habit.getName(),
                    Streaks.current(today, comps), comps.contains(today), rate));
        }
        return result;
    }

    private Integer consistency(HabitData data, LocalDate windowStart, LocalDate windowEnd, boolean started) {
        if (data.habits().isEmpty() || !started) {
            return null;
        }
        List<Integer> rates = new ArrayList<>();
        for (Habit habit : data.habits()) {
            Set<LocalDate> comps = data.completions().getOrDefault(habit.getId(), Set.of());
            LocalDate effStart = windowStart.isAfter(habit.getStartDate()) ? windowStart : habit.getStartDate();
            rates.add(rateInWindow(comps, effStart, windowEnd));
        }
        return SprintScore.average(rates);
    }

    private static int rateInWindow(Set<LocalDate> comps, LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            return 0;
        }
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        long done = comps.stream().filter(d -> !d.isBefore(start) && !d.isAfter(end)).count();
        return (int) Math.min(100, Math.round((done * 100.0) / days));
    }

    private static Integer averageGoalProgress(List<Goal> goals) {
        if (goals.isEmpty()) {
            return null;
        }
        return SprintScore.average(goals.stream()
                .map(g -> QuarterMath.progressPercent(g.getCurrentValue(), g.getTargetValue()))
                .toList());
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
