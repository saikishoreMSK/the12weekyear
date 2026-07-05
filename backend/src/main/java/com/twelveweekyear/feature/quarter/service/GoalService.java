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

import java.util.UUID;

/** Weekly goals inside a quarter — one goal per week. All operations verify quarter ownership. */
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
        requireWeekInRange(quarter, request.week());
        if (goalRepository.existsByQuarterIdAndWeek(quarterId, request.week())) {
            throw new AppException(ErrorCode.CONFLICT, "That week already has a goal");
        }

        Goal goal = new Goal();
        goal.setQuarterId(quarterId);
        goal.setTitle(request.title().trim());
        goal.setWeek(request.week());
        goal.setDone(false);
        goalRepository.save(goal);

        return toResponse(goal, quarter, userId);
    }

    @Transactional
    public GoalResponse updateGoal(UUID userId, UUID quarterId, UUID goalId, UpdateGoalRequest request) {
        Quarter quarter = quarterService.requireOwnedQuarter(userId, quarterId);
        Goal goal = goalRepository.findByIdAndQuarterId(goalId, quarterId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.title() != null) {
            goal.setTitle(request.title().trim());
        }
        if (request.week() != null && request.week() != goal.getWeek()) {
            requireWeekInRange(quarter, request.week());
            if (goalRepository.existsByQuarterIdAndWeek(quarterId, request.week())) {
                throw new AppException(ErrorCode.CONFLICT, "That week already has a goal");
            }
            goal.setWeek(request.week());
        }
        if (request.done() != null) {
            goal.setDone(request.done());
        }
        return toResponse(goal, quarter, userId);
    }

    @Transactional
    public void deleteGoal(UUID userId, UUID quarterId, UUID goalId) {
        quarterService.requireOwnedQuarter(userId, quarterId);
        Goal goal = goalRepository.findByIdAndQuarterId(goalId, quarterId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private void requireWeekInRange(Quarter quarter, int week) {
        int totalWeeks = QuarterMath.totalWeeks(
                QuarterMath.bounds(quarter.getYear(), quarter.getQuarterNumber()).totalDays());
        if (week < 1 || week > totalWeeks) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Week must be between 1 and " + totalWeeks);
        }
    }

    private GoalResponse toResponse(Goal goal, Quarter quarter, UUID userId) {
        QuarterMath.Progress p = QuarterMath.progress(
                quarter.getYear(), quarter.getQuarterNumber(), userTimeService.today(userId));
        return quarterMapper.toGoalResponse(goal, p.state(), p.currentWeek());
    }
}
