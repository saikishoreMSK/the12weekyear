package com.twelveweekyear.common.exception;

/**
 * Base type for all expected (business) failures.
 *
 * <p>Carries an {@link ErrorCode} so the {@code GlobalExceptionHandler} can derive the HTTP
 * status and client-facing code in one place. Feature code should throw a meaningful subclass
 * (e.g. {@link ResourceNotFoundException}) rather than this directly.
 */
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode) {
        super(errorCode.defaultMessage());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
