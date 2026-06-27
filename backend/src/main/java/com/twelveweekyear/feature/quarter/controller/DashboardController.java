package com.twelveweekyear.feature.quarter.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.quarter.dto.YearDashboardResponse;
import com.twelveweekyear.feature.quarter.service.QuarterService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** The 2×2 year overview (four quarter tiles). Defaults to the current year. */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final QuarterService quarterService;

    public DashboardController(QuarterService quarterService) {
        this.quarterService = quarterService;
    }

    @GetMapping
    public ApiResponse<YearDashboardResponse> get(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(required = false) Integer year) {
        return ApiResponse.success(quarterService.getYearDashboard(user.id(), year));
    }
}
