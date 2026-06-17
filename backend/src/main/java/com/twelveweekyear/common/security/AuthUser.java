package com.twelveweekyear.common.security;

import java.util.UUID;

/**
 * The authenticated principal placed in the security context by {@code JwtAuthenticationFilter}.
 * Controllers obtain it via {@code @AuthenticationPrincipal AuthUser user}.
 */
public record AuthUser(UUID id, String email) {
}
