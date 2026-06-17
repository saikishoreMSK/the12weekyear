package com.twelveweekyear.common.exception;

import com.twelveweekyear.common.api.ApiError;
import com.twelveweekyear.common.api.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Single translation point from exceptions to the {@link ApiResponse} envelope.
 *
 * <p>Controllers and services never build error responses themselves — they throw, and this
 * advice maps the throwable to a status + stable error code. Keeping it centralised guarantees
 * every client sees a consistent error shape.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode code = ex.getErrorCode();
        ApiError error = new ApiError(code.name(), ex.getMessage());
        return ResponseEntity.status(code.status()).body(ApiResponse.failure(error));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiError.FieldViolation> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.FieldViolation(fe.getField(), fe.getDefaultMessage()))
                .toList();
        ApiError error = new ApiError(
                ErrorCode.VALIDATION_FAILED.name(),
                ErrorCode.VALIDATION_FAILED.defaultMessage(),
                violations);
        return ResponseEntity.status(ErrorCode.VALIDATION_FAILED.status())
                .body(ApiResponse.failure(error));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        // Log the real cause server-side; never leak internals to the client.
        log.error("Unhandled exception", ex);
        ApiError error = new ApiError(
                ErrorCode.INTERNAL_ERROR.name(),
                ErrorCode.INTERNAL_ERROR.defaultMessage());
        return ResponseEntity.status(ErrorCode.INTERNAL_ERROR.status())
                .body(ApiResponse.failure(error));
    }
}
