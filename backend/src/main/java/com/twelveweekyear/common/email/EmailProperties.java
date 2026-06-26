package com.twelveweekyear.common.email;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Email settings (prefix {@code app.email}).
 *
 * @param provider     "log" (default; prints to the log) or "resend".
 * @param from         the From address (must be on a verified domain for Resend in production).
 * @param resendApiKey Resend API key (only needed when provider=resend).
 */
@ConfigurationProperties(prefix = "app.email")
public record EmailProperties(
        String provider,
        String from,
        String resendApiKey
) {
}
