package com.twelveweekyear.feature.analytics.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.analytics.dto.AnalyticsResponse;
import com.twelveweekyear.feature.analytics.service.AnalyticsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Overall habit/streak analytics for the authenticated user. */
@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ApiResponse<AnalyticsResponse> get(@AuthenticationPrincipal AuthUser user) {
        return ApiResponse.success(analyticsService.getAnalytics(user.id()));
    }
}
