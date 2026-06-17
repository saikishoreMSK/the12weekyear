package com.twelveweekyear.feature.habit.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.common.exception.ResourceNotFoundException;
import com.twelveweekyear.feature.habit.domain.Habit;
import com.twelveweekyear.feature.habit.domain.HabitCompletion;
import com.twelveweekyear.feature.habit.dto.CreateHabitRequest;
import com.twelveweekyear.feature.habit.dto.HabitResponse;
import com.twelveweekyear.feature.habit.dto.UpdateHabitRequest;
import com.twelveweekyear.feature.habit.mapper.HabitMapper;
import com.twelveweekyear.feature.habit.repository.HabitCompletionRepository;
import com.twelveweekyear.feature.habit.repository.HabitRepository;
import com.twelveweekyear.feature.user.service.UserTimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/** Habit CRUD plus daily completion toggling. All operations are scoped to the owning user. */
@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;
    private final UserTimeService userTimeService;
    private final HabitMapper habitMapper;

    public HabitService(HabitRepository habitRepository,
                        HabitCompletionRepository completionRepository,
                        UserTimeService userTimeService,
                        HabitMapper habitMapper) {
        this.habitRepository = habitRepository;
        this.completionRepository = completionRepository;
        this.userTimeService = userTimeService;
        this.habitMapper = habitMapper;
    }

    @Transactional
    public HabitResponse create(UUID userId, CreateHabitRequest request) {
        LocalDate today = userTimeService.today(userId);
        Habit habit = new Habit();
        habit.setUserId(userId);
        habit.setName(request.name().trim());
        habit.setDescription(blankToNull(request.description()));
        habit.setColor(blankToNull(request.color()));
        habit.setStartDate(request.startDate() != null ? request.startDate() : today);
        habit.setActive(true);
        habitRepository.save(habit);
        return habitMapper.toResponse(habit, Set.of(), today);
    }

    @Transactional(readOnly = true)
    public List<HabitResponse> list(UUID userId) {
        LocalDate today = userTimeService.today(userId);
        List<Habit> habits = habitRepository.findByUserIdOrderByCreatedAtAsc(userId);

        // One query for all completions, grouped in memory, to avoid N+1.
        List<UUID> habitIds = habits.stream().map(Habit::getId).toList();
        Map<UUID, Set<LocalDate>> byHabit = completionRepository.findByHabitIdIn(habitIds).stream()
                .collect(Collectors.groupingBy(
                        HabitCompletion::getHabitId,
                        Collectors.mapping(HabitCompletion::getCompletionDate, Collectors.toSet())));

        return habits.stream()
                .map(habit -> habitMapper.toResponse(
                        habit, byHabit.getOrDefault(habit.getId(), Set.<LocalDate>of()), today))
                .toList();
    }

    @Transactional(readOnly = true)
    public HabitResponse get(UUID userId, UUID habitId) {
        Habit habit = requireOwnedHabit(userId, habitId);
        return toResponse(habit, userId);
    }

    @Transactional
    public HabitResponse update(UUID userId, UUID habitId, UpdateHabitRequest request) {
        Habit habit = requireOwnedHabit(userId, habitId);
        if (request.name() != null) habit.setName(request.name().trim());
        if (request.description() != null) habit.setDescription(blankToNull(request.description()));
        if (request.color() != null) habit.setColor(blankToNull(request.color()));
        if (request.active() != null) habit.setActive(request.active());
        return toResponse(habit, userId);
    }

    @Transactional
    public void delete(UUID userId, UUID habitId) {
        Habit habit = requireOwnedHabit(userId, habitId);
        completionRepository.deleteByHabitId(habit.getId());
        habitRepository.delete(habit);
    }

    @Transactional
    public HabitResponse toggleToday(UUID userId, UUID habitId) {
        Habit habit = requireOwnedHabit(userId, habitId);
        LocalDate today = userTimeService.today(userId);
        setCompletion(habit.getId(), today,
                !completionRepository.existsByHabitIdAndCompletionDate(habit.getId(), today));
        return toResponse(habit, userId);
    }

    @Transactional
    public HabitResponse setCompletionForDate(UUID userId, UUID habitId, LocalDate date, boolean completed) {
        Habit habit = requireOwnedHabit(userId, habitId);
        if (date.isAfter(userTimeService.today(userId))) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Cannot record a completion for a future date");
        }
        setCompletion(habit.getId(), date, completed);
        return toResponse(habit, userId);
    }

    private void setCompletion(UUID habitId, LocalDate date, boolean completed) {
        boolean exists = completionRepository.existsByHabitIdAndCompletionDate(habitId, date);
        if (completed && !exists) {
            HabitCompletion completion = new HabitCompletion();
            completion.setHabitId(habitId);
            completion.setCompletionDate(date);
            completion.setCreatedAt(Instant.now());
            completionRepository.save(completion);
        } else if (!completed && exists) {
            completionRepository.findByHabitIdAndCompletionDate(habitId, date)
                    .ifPresent(completionRepository::delete);
        }
    }

    private Habit requireOwnedHabit(UUID userId, UUID habitId) {
        return habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));
    }

    private HabitResponse toResponse(Habit habit, UUID userId) {
        Set<LocalDate> completions = completionRepository.findByHabitId(habit.getId()).stream()
                .map(HabitCompletion::getCompletionDate)
                .collect(Collectors.toCollection(HashSet::new));
        return habitMapper.toResponse(habit, completions, userTimeService.today(userId));
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
