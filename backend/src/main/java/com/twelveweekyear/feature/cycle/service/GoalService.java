package com.twelveweekyear.feature.cycle.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.common.exception.ResourceNotFoundException;
import com.twelveweekyear.feature.cycle.domain.Cycle;
import com.twelveweekyear.feature.cycle.domain.Goal;
import com.twelveweekyear.feature.cycle.dto.CreateGoalRequest;
import com.twelveweekyear.feature.cycle.dto.GoalResponse;
import com.twelveweekyear.feature.cycle.dto.UpdateGoalRequest;
import com.twelveweekyear.feature.cycle.mapper.CycleMapper;
import com.twelveweekyear.feature.cycle.repository.GoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** Manages the goals inside a cycle. All operations verify the cycle belongs to the caller. */
@Service
public class GoalService {

    private static final int DEFAULT_WEEK_START = 1;
    private static final int DEFAULT_WEEK_END = Cycle.TOTAL_WEEKS;

    private final CycleService cycleService;
    private final GoalRepository goalRepository;
    private final CycleMapper cycleMapper;

    public GoalService(CycleService cycleService,
                       GoalRepository goalRepository,
                       CycleMapper cycleMapper) {
        this.cycleService = cycleService;
        this.goalRepository = goalRepository;
        this.cycleMapper = cycleMapper;
    }

    @Transactional
    public GoalResponse addGoal(UUID userId, UUID cycleId, CreateGoalRequest request) {
        cycleService.requireOwnedCycle(userId, cycleId);

        int weekStart = request.weekStart() != null ? request.weekStart() : DEFAULT_WEEK_START;
        int weekEnd = request.weekEnd() != null ? request.weekEnd() : DEFAULT_WEEK_END;
        requireValidWeekRange(weekStart, weekEnd);

        Goal goal = new Goal();
        goal.setCycleId(cycleId);
        goal.setCategory(request.category().trim());
        goal.setTitle(request.title().trim());
        goal.setUnit(request.unit().trim());
        goal.setTargetValue(request.targetValue());
        goal.setCurrentValue(0);
        goal.setWeekStart(weekStart);
        goal.setWeekEnd(weekEnd);
        goalRepository.save(goal);
        return cycleMapper.toGoalResponse(goal);
    }

    @Transactional
    public GoalResponse updateGoal(UUID userId, UUID cycleId, UUID goalId, UpdateGoalRequest request) {
        cycleService.requireOwnedCycle(userId, cycleId);
        Goal goal = goalRepository.findByIdAndCycleId(goalId, cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.category() != null) goal.setCategory(request.category().trim());
        if (request.title() != null) goal.setTitle(request.title().trim());
        if (request.unit() != null) goal.setUnit(request.unit().trim());
        if (request.targetValue() != null) goal.setTargetValue(request.targetValue());
        if (request.currentValue() != null) goal.setCurrentValue(request.currentValue());
        if (request.weekStart() != null) goal.setWeekStart(request.weekStart());
        if (request.weekEnd() != null) goal.setWeekEnd(request.weekEnd());

        requireValidWeekRange(goal.getWeekStart(), goal.getWeekEnd());
        return cycleMapper.toGoalResponse(goal);
    }

    @Transactional
    public void deleteGoal(UUID userId, UUID cycleId, UUID goalId) {
        cycleService.requireOwnedCycle(userId, cycleId);
        Goal goal = goalRepository.findByIdAndCycleId(goalId, cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private void requireValidWeekRange(int weekStart, int weekEnd) {
        if (weekEnd < weekStart) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "weekEnd must be greater than or equal to weekStart");
        }
    }
}
