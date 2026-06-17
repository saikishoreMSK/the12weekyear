package com.twelveweekyear.feature.cycle.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.cycle.dto.CreateCycleRequest;
import com.twelveweekyear.feature.cycle.dto.CycleResponse;
import com.twelveweekyear.feature.cycle.dto.CycleSummaryResponse;
import com.twelveweekyear.feature.cycle.dto.UpdateCycleRequest;
import com.twelveweekyear.feature.cycle.service.CycleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** 12-week cycles for the authenticated user. */
@RestController
@RequestMapping("/api/v1/cycles")
public class CycleController {

    private final CycleService cycleService;

    public CycleController(CycleService cycleService) {
        this.cycleService = cycleService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CycleResponse> create(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody CreateCycleRequest request) {
        return ApiResponse.success(cycleService.create(user.id(), request));
    }

    @GetMapping
    public ApiResponse<List<CycleSummaryResponse>> list(@AuthenticationPrincipal AuthUser user) {
        return ApiResponse.success(cycleService.list(user.id()));
    }

    @GetMapping("/current")
    public ApiResponse<CycleResponse> current(@AuthenticationPrincipal AuthUser user) {
        return ApiResponse.success(cycleService.getCurrent(user.id()));
    }

    @GetMapping("/{cycleId}")
    public ApiResponse<CycleResponse> get(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID cycleId) {
        return ApiResponse.success(cycleService.get(user.id(), cycleId));
    }

    @PatchMapping("/{cycleId}")
    public ApiResponse<CycleResponse> update(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID cycleId,
            @Valid @RequestBody UpdateCycleRequest request) {
        return ApiResponse.success(cycleService.update(user.id(), cycleId, request));
    }

    @DeleteMapping("/{cycleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID cycleId) {
        cycleService.delete(user.id(), cycleId);
    }
}
