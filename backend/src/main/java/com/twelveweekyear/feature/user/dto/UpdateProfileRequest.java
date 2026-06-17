package com.twelveweekyear.feature.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Profile fields a user may change. Email is immutable here (changing it is an account-security
 * flow for a later phase). Timezone validity (a real IANA id) is checked in the service layer.
 */
public record UpdateProfileRequest(
        @NotBlank @Size(max = 80) String displayName,
        @NotBlank String timezone
) {
}
