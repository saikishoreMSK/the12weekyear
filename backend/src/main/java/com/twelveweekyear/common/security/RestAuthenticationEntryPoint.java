package com.twelveweekyear.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twelveweekyear.common.api.ApiError;
import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Returns the standard {@link ApiResponse} envelope (401) when an unauthenticated request hits a protected route. */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        ErrorCode code = ErrorCode.UNAUTHORIZED;
        response.setStatus(code.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> body = ApiResponse.failure(
                new ApiError(code.name(), code.defaultMessage()));
        objectMapper.writeValue(response.getWriter(), body);
    }
}
