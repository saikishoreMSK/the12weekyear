package com.twelveweekyear.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * Machine-readable error payload carried inside {@link ApiResponse}.
 *
 * <p>{@code code} is a stable enum name (see {@code ErrorCode}) that clients can switch on
 * without parsing human-facing text. {@code details} is populated only for validation errors.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        String code,
        String message,
        List<FieldViolation> details
) {

    public ApiError(String code, String message) {
        this(code, message, null);
    }

    /** A single field-level validation failure. */
    public record FieldViolation(String field, String message) {
    }
}
