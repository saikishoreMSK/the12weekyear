package com.twelveweekyear.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Canonical catalogue of application error codes.
 *
 * <p>Each code maps to exactly one HTTP status. The enum name is what travels to the client as
 * {@code error.code}, so renaming a constant is a breaking API change — treat it as contract.
 */
public enum ErrorCode {

    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Validation failed"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication required"),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "Email not verified"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Access denied"),
    CONFLICT(HttpStatus.CONFLICT, "Resource conflict"),
    TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, "Too many requests"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus status() {
        return status;
    }

    public String defaultMessage() {
        return defaultMessage;
    }
}
