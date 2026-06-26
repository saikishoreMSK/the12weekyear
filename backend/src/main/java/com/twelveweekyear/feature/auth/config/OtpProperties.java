package com.twelveweekyear.feature.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * OTP behaviour (prefix {@code app.otp}).
 *
 * @param length         number of digits in the code.
 * @param expiry         how long a code is valid.
 * @param resendCooldown minimum wait between requesting codes.
 * @param maxAttempts    wrong tries allowed before a code locks (and must be resent).
 */
@ConfigurationProperties(prefix = "app.otp")
public record OtpProperties(
        int length,
        Duration expiry,
        Duration resendCooldown,
        int maxAttempts
) {
}
