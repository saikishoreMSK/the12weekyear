package com.twelveweekyear.feature.habit.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.habit.dto.CreateHabitRequest;
import com.twelveweekyear.feature.habit.dto.HabitResponse;
import com.twelveweekyear.feature.habit.dto.UpdateHabitRequest;
import com.twelveweekyear.feature.habit.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Habits and their daily completions for the authenticated user. */
@RestController
@RequestMapping("/api/v1/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<HabitResponse> create(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody CreateHabitRequest request) {
        return ApiResponse.success(habitService.create(user.id(), request));
    }

    @GetMapping
    public ApiResponse<List<HabitResponse>> list(@AuthenticationPrincipal AuthUser user) {
        return ApiResponse.success(habitService.list(user.id()));
    }

    @GetMapping("/{habitId}")
    public ApiResponse<HabitResponse> get(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID habitId) {
        return ApiResponse.success(habitService.get(user.id(), habitId));
    }

    @PatchMapping("/{habitId}")
    public ApiResponse<HabitResponse> update(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID habitId,
            @Valid @RequestBody UpdateHabitRequest request) {
        return ApiResponse.success(habitService.update(user.id(), habitId, request));
    }

    @DeleteMapping("/{habitId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID habitId) {
        habitService.delete(user.id(), habitId);
    }

    /** Toggle today's completion (today resolved in the user's timezone). The primary daily action. */
    @PostMapping("/{habitId}/today")
    public ApiResponse<HabitResponse> toggleToday(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID habitId) {
        return ApiResponse.success(habitService.toggleToday(user.id(), habitId));
    }

    /** Mark a specific (non-future) date complete — used for backfilling missed days. */
    @PutMapping("/{habitId}/completions/{date}")
    public ApiResponse<HabitResponse> markDate(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID habitId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.success(habitService.setCompletionForDate(user.id(), habitId, date, true));
    }

    @DeleteMapping("/{habitId}/completions/{date}")
    public ApiResponse<HabitResponse> unmarkDate(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID habitId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.success(habitService.setCompletionForDate(user.id(), habitId, date, false));
    }
}
