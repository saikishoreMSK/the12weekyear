package com.twelveweekyear.feature.auth.dto;

/**
 * Returned by registration. No tokens yet — the user must verify their email (via the OTP just
 * sent) before they can sign in.
 */
public record RegistrationResponse(
        String email,
        boolean verificationRequired
) {
}
