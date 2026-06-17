package com.twelveweekyear.feature.user.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.user.dto.UpdateProfileRequest;
import com.twelveweekyear.feature.user.dto.UserResponse;
import com.twelveweekyear.feature.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The authenticated user's own profile ({@code /me}). Requires a valid access token. */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMe(@AuthenticationPrincipal AuthUser principal) {
        return ApiResponse.success(userService.getProfile(principal.id()));
    }

    @PatchMapping("/me")
    public ApiResponse<UserResponse> updateMe(
            @AuthenticationPrincipal AuthUser principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userService.updateProfile(principal.id(), request));
    }
}
