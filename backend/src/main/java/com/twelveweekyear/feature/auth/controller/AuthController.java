package com.twelveweekyear.feature.auth.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.feature.auth.dto.AuthResponse;
import com.twelveweekyear.feature.auth.dto.ForgotPasswordRequest;
import com.twelveweekyear.feature.auth.dto.LoginRequest;
import com.twelveweekyear.feature.auth.dto.RefreshRequest;
import com.twelveweekyear.feature.auth.dto.RegisterRequest;
import com.twelveweekyear.feature.auth.dto.RegistrationResponse;
import com.twelveweekyear.feature.auth.dto.ResendOtpRequest;
import com.twelveweekyear.feature.auth.dto.ResetPasswordRequest;
import com.twelveweekyear.feature.auth.dto.VerifyEmailRequest;
import com.twelveweekyear.feature.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Public authentication endpoints. All return the standard {@link ApiResponse} envelope. */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RegistrationResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request));
    }

    @PostMapping("/verify-email")
    public ApiResponse<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ApiResponse.success(authService.verifyEmail(request.email(), request.code()));
    }

    @PostMapping("/resend-otp")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ApiResponse<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request.email(), request.purpose());
        return ApiResponse.success(null);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ApiResponse.success(null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.email(), request.code(), request.newPassword());
        return ApiResponse.success(null);
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.success(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.refreshToken());
    }
}
