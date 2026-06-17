package com.twelveweekyear.feature.auth.dto;

import com.twelveweekyear.feature.user.dto.UserResponse;

/**
 * Returned by register/login/refresh. Tokens are delivered in the body (not a cookie) so the same
 * contract serves the web app and the future native app, which stores them in secure storage.
 *
 * @param tokenType always {@code Bearer}.
 * @param expiresIn access-token lifetime in seconds.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}
