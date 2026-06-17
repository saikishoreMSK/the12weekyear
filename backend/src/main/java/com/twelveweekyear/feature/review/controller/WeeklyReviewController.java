package com.twelveweekyear.feature.review.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.review.dto.WeeklyReviewRequest;
import com.twelveweekyear.feature.review.dto.WeeklyReviewResponse;
import com.twelveweekyear.feature.review.service.WeeklyReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Weekly reviews nested under a cycle. */
@RestController
@RequestMapping("/api/v1/cycles/{cycleId}/reviews")
public class WeeklyReviewController {

    private final WeeklyReviewService reviewService;

    public WeeklyReviewController(WeeklyReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ApiResponse<List<WeeklyReviewResponse>> list(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID cycleId) {
        return ApiResponse.success(reviewService.list(user.id(), cycleId));
    }

    @GetMapping("/{weekNumber}")
    public ApiResponse<WeeklyReviewResponse> get(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID cycleId,
            @PathVariable int weekNumber) {
        return ApiResponse.success(reviewService.get(user.id(), cycleId, weekNumber));
    }

    /** Create or update the review for a week. */
    @PutMapping("/{weekNumber}")
    public ApiResponse<WeeklyReviewResponse> upsert(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID cycleId,
            @PathVariable int weekNumber,
            @Valid @RequestBody WeeklyReviewRequest request) {
        return ApiResponse.success(reviewService.upsert(user.id(), cycleId, weekNumber, request));
    }
}
