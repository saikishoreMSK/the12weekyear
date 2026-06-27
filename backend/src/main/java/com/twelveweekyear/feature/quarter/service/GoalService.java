package com.twelveweekyear.feature.quarter.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.common.exception.ResourceNotFoundException;
import com.twelveweekyear.feature.quarter.domain.Goal;
import com.twelveweekyear.feature.quarter.domain.Quarter;
import com.twelveweekyear.feature.quarter.dto.CreateGoalRequest;
import com.twelveweekyear.feature.quarter.dto.GoalResponse;
import com.twelveweekyear.feature.quarter.dto.UpdateGoalRequest;
import com.twelveweekyear.feature.quarter.mapper.QuarterMapper;
import com.twelveweekyear.feature.quarter.repository.GoalRepository;
import com.twelveweekyear.feature.quarter.support.QuarterMath;
import com.twelveweekyear.feature.user.service.UserTimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

/** Goals inside a quarter. All operations verify the quarter belongs to the caller. */
@Service
public class GoalService {

    private final QuarterService quarterService;
    private final GoalRepository goalRepository;
    private final UserTimeService userTimeService;
    private final QuarterMapper quarterMapper;

    public GoalService(QuarterService quarterService,
                       GoalRepository goalRepository,
                       UserTimeService userTimeService,
                       QuarterMapper quarterMapper) {
        this.quarterService = quarterService;
        this.goalRepository = goalRepository;
        this.userTimeService = userTimeService;
        this.quarterMapper = quarterMapper;
    }

    @Transactional
    public GoalResponse addGoal(UUID userId, UUID quarterId, CreateGoalRequest request) {
        Quarter quarter = quarterService.requireOwnedQuarter(userId, quarterId);
        int totalWeeks = QuarterMath.totalWeeks(
                QuarterMath.bounds(quarter.getYear(), quarter.getQuarterNumber()).totalDays());

        int weekStart = request.weekStart() != null ? request.weekStart() : 1;
        int weekEnd = request.weekEnd() != null ? request.weekEnd() : totalWeeks;
        requireValidWeekRange(weekStart, weekEnd);

        Goal goal = new Goal();
        goal.setQuarterId(quarterId);
        goal.setCategory(request.category().trim());
        goal.setTitle(request.title().trim());
        goal.setUnit(request.unit().trim());
        goal.setTargetValue(request.targetValue());
        goal.setCurrentValue(0);
        goal.setWeekStart(weekStart);
        goal.setWeekEnd(weekEnd);
        goalRepository.save(goal);

        return toResponse(goal, quarter, userId);
    }

    @Transactional
    public GoalResponse updateGoal(UUID userId, UUID quarterId, UUID goalId, UpdateGoalRequest request) {
        Quarter quarter = quarterService.requireOwnedQuarter(userId, quarterId);
        Goal goal = goalRepository.findByIdAndQuarterId(goalId, quarterId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.category() != null) goal.setCategory(request.category().trim());
        if (request.title() != null) goal.setTitle(request.title().trim());
        if (request.unit() != null) goal.setUnit(request.unit().trim());
        if (request.targetValue() != null) goal.setTargetValue(request.targetValue());
        if (request.currentValue() != null) goal.setCurrentValue(request.currentValue());
        if (request.weekStart() != null) goal.setWeekStart(request.weekStart());
        if (request.weekEnd() != null) goal.setWeekEnd(request.weekEnd());

        requireValidWeekRange(goal.getWeekStart(), goal.getWeekEnd());
        return toResponse(goal, quarter, userId);
    }

    @Transactional
    public void deleteGoal(UUID userId, UUID quarterId, UUID goalId) {
        quarterService.requireOwnedQuarter(userId, quarterId);
        Goal goal = goalRepository.findByIdAndQuarterId(goalId, quarterId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private GoalResponse toResponse(Goal goal, Quarter quarter, UUID userId) {
        QuarterMath.Progress p = QuarterMath.progress(
                quarter.getYear(), quarter.getQuarterNumber(), userTimeService.today(userId));
        boolean active = p.currentDay() != null;
        return quarterMapper.toGoalResponse(goal, active, active ? p.currentDay() : 0, p.totalDays());
    }

    private void requireValidWeekRange(int weekStart, int weekEnd) {
        if (weekEnd < weekStart) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "weekEnd must be greater than or equal to weekStart");
        }
    }
}
