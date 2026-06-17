package com.twelveweekyear.feature.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Registration payload. {@code timezone} is optional — when blank the service defaults it to UTC;
 * when present it must be a valid IANA zone id (validated in the service).
 */
public record RegisterRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(max = 80) String displayName,
        String timezone
) {
}
