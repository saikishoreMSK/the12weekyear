package com.twelveweekyear.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * Standard response envelope returned by every endpoint.
 *
 * <p>A single, predictable shape so that any client — the Next.js web app today and the
 * React Native Android app later — parses success and error responses identically.
 *
 * <pre>
 * { "success": true,  "data": { ... }, "error": null,       "timestamp": "..." }
 * { "success": false, "data": null,    "error": { ... },    "timestamp": "..." }
 * </pre>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        T data,
        ApiError error,
        Instant timestamp
) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, Instant.now());
    }

    public static <T> ApiResponse<T> failure(ApiError error) {
        return new ApiResponse<>(false, null, error, Instant.now());
    }
}
