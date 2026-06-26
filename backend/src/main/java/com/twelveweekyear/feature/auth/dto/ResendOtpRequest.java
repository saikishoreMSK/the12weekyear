package com.twelveweekyear.feature.auth.dto;

import com.twelveweekyear.feature.auth.domain.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResendOtpRequest(
        @NotBlank @Email String email,
        @NotNull OtpPurpose purpose
) {
}
