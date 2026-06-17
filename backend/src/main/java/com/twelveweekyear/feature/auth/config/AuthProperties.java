package com.twelveweekyear.feature.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Externalised auth settings (prefix {@code app.auth}). The secret and token lifetimes come from
 * the environment so they differ per deployment without code changes.
 *
 * @param jwtSecret       HS256 signing secret; must be at least 32 bytes (256 bits).
 * @param accessTokenTtl  how long an access token is valid.
 * @param refreshTokenTtl how long a refresh token is valid.
 */
@ConfigurationProperties(prefix = "app.auth")
public record AuthProperties(
        String jwtSecret,
        Duration accessTokenTtl,
        Duration refreshTokenTtl
) {
}
