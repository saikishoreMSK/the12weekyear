package com.twelveweekyear.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twelveweekyear.common.api.ApiError;
import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Returns the standard {@link ApiResponse} envelope (403) when an authenticated user lacks access. */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RestAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        ErrorCode code = ErrorCode.FORBIDDEN;
        response.setStatus(code.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> body = ApiResponse.failure(
                new ApiError(code.name(), code.defaultMessage()));
        objectMapper.writeValue(response.getWriter(), body);
    }
}
