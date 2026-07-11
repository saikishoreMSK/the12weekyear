package com.twelveweekyear.feature.feedback.controller;

import com.twelveweekyear.common.api.ApiResponse;
import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.feedback.dto.CreateFeedbackRequest;
import com.twelveweekyear.feature.feedback.dto.FeedbackResponse;
import com.twelveweekyear.feature.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Feedback submission. Public: signed-in users are attributed (via the token, if present); guests
 * submit anonymously (userId null). Read back only in the web admin panel.
 */
@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FeedbackResponse> submit(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody CreateFeedbackRequest request) {
        return ApiResponse.success(feedbackService.create(user != null ? user.id() : null, request));
    }
}
