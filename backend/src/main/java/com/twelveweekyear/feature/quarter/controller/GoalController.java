package com.twelveweekyear.feature.quarter.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.quarter.dto.CreateGoalRequest;
import com.twelveweekyear.feature.quarter.dto.GoalResponse;
import com.twelveweekyear.feature.quarter.dto.UpdateGoalRequest;
import com.twelveweekyear.feature.quarter.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/** Goals nested under a quarter. */
@RestController
@RequestMapping("/api/v1/quarters/{quarterId}/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GoalResponse> add(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId,
            @Valid @RequestBody CreateGoalRequest request) {
        return ApiResponse.success(goalService.addGoal(user.id(), quarterId, request));
    }

    @PatchMapping("/{goalId}")
    public ApiResponse<GoalResponse> update(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId,
            @PathVariable UUID goalId,
            @Valid @RequestBody UpdateGoalRequest request) {
        return ApiResponse.success(goalService.updateGoal(user.id(), quarterId, goalId, request));
    }

    @DeleteMapping("/{goalId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId,
            @PathVariable UUID goalId) {
        goalService.deleteGoal(user.id(), quarterId, goalId);
    }
}
