package com.twelveweekyear.feature.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twelveweekyear.feature.auth.dto.AuthResponse;
import com.twelveweekyear.feature.auth.dto.RegisterRequest;
import com.twelveweekyear.feature.auth.service.AuthService;
import com.twelveweekyear.feature.user.dto.UserResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void registerReturnsCreatedWithTokensEnvelope() throws Exception {
        var user = new UserResponse(UUID.randomUUID(), "alice@example.com", "Alice", "UTC", Instant.now());
        when(authService.register(any())).thenReturn(
                new AuthResponse("access-token", "refresh-token", "Bearer", 900, user));

        var body = new RegisterRequest("alice@example.com", "password123", "Alice", "Asia/Kolkata");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("alice@example.com"));
    }

    @Test
    void registerRejectsInvalidPayloadWithValidationEnvelope() throws Exception {
        // Blank email + too-short password should fail bean validation before reaching the service.
        var body = new RegisterRequest("", "short", "", null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.error.details").isArray());
    }
}
