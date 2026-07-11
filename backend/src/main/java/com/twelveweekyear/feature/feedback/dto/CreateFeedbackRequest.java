package com.twelveweekyear.feature.feedback.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** {@code rating} is optional (1–5); {@code message} is required. */
public record CreateFeedbackRequest(
        @NotBlank @Size(max = 2000) String message,
        @Min(1) @Max(5) Integer rating
) {
}
