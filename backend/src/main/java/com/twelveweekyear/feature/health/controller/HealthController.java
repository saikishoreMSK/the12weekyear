package com.twelveweekyear.feature.health.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.feature.health.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Versioned liveness endpoint that doubles as the reference example of the layering convention:
 * {@code controller -> (service) -> (repository)}, always returning the {@link ApiResponse}
 * envelope. The health check has no business logic, so it has no service layer yet.
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ApiResponse<HealthResponse> health() {
        return ApiResponse.success(
                new HealthResponse("UP", "the-12-week-year-backend", "v1"));
    }
}
