package com.twelveweekyear.feature.health.dto;

/**
 * Lightweight liveness payload for clients (web/mobile) to confirm the API is reachable.
 *
 * <p>Distinct from Spring Actuator's {@code /actuator/health}, which is for infrastructure
 * probes. This one lives under the versioned {@code /api/v1} contract that apps consume.
 */
public record HealthResponse(
        String status,
        String service,
        String apiVersion
) {
}
