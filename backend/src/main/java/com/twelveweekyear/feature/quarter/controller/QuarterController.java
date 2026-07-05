package com.twelveweekyear.feature.quarter.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.quarter.dto.CreateQuarterRequest;
import com.twelveweekyear.feature.quarter.dto.QuarterReportResponse;
import com.twelveweekyear.feature.quarter.dto.QuarterResponse;
import com.twelveweekyear.feature.quarter.dto.UpdateQuarterRequest;
import com.twelveweekyear.feature.quarter.service.QuarterService;
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

import java.util.UUID;

/** Calendar quarters for the authenticated user. */
@RestController
@RequestMapping("/api/v1/quarters")
public class QuarterController {

    private final QuarterService quarterService;

    public QuarterController(QuarterService quarterService) {
        this.quarterService = quarterService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<QuarterResponse> create(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody CreateQuarterRequest request) {
        return ApiResponse.success(quarterService.create(user.id(), request));
    }

    @GetMapping("/current")
    public ApiResponse<QuarterResponse> current(@AuthenticationPrincipal AuthUser user) {
        return ApiResponse.success(quarterService.getCurrent(user.id()));
    }

    @GetMapping("/{quarterId}")
    public ApiResponse<QuarterResponse> get(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId) {
        return ApiResponse.success(quarterService.get(user.id(), quarterId));
    }

    @GetMapping("/{quarterId}/report")
    public ApiResponse<QuarterReportResponse> report(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId) {
        return ApiResponse.success(quarterService.getReport(user.id(), quarterId));
    }

    @PatchMapping("/{quarterId}")
    public ApiResponse<QuarterResponse> update(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId,
            @Valid @RequestBody UpdateQuarterRequest request) {
        return ApiResponse.success(quarterService.update(user.id(), quarterId, request));
    }

    @DeleteMapping("/{quarterId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId) {
        quarterService.delete(user.id(), quarterId);
    }
}
