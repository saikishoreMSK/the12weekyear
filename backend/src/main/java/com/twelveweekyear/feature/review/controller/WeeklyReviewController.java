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

/** Weekly reviews nested under a quarter. */
@RestController
@RequestMapping("/api/v1/quarters/{quarterId}/reviews")
public class WeeklyReviewController {

    private final WeeklyReviewService reviewService;

    public WeeklyReviewController(WeeklyReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ApiResponse<List<WeeklyReviewResponse>> list(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId) {
        return ApiResponse.success(reviewService.list(user.id(), quarterId));
    }

    @GetMapping("/{weekNumber}")
    public ApiResponse<WeeklyReviewResponse> get(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId,
            @PathVariable int weekNumber) {
        return ApiResponse.success(reviewService.get(user.id(), quarterId, weekNumber));
    }

    /** Create or update the review for a week. */
    @PutMapping("/{weekNumber}")
    public ApiResponse<WeeklyReviewResponse> upsert(
            @AuthenticationPrincipal AuthUser user,
            @PathVariable UUID quarterId,
            @PathVariable int weekNumber,
            @Valid @RequestBody WeeklyReviewRequest request) {
        return ApiResponse.success(reviewService.upsert(user.id(), quarterId, weekNumber, request));
    }
}
