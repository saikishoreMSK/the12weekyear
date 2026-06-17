package com.twelveweekyear.feature.user.dto;

import java.time.Instant;
import java.util.UUID;

/** Public projection of a {@code User}. Never exposes the password hash. */
public record UserResponse(
        UUID id,
        String email,
        String displayName,
        String timezone,
        Instant createdAt
) {
}
