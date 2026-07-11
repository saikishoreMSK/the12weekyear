package com.twelveweekyear.feature.feedback.service;

import com.twelveweekyear.feature.feedback.domain.Feedback;
import com.twelveweekyear.feature.feedback.dto.CreateFeedbackRequest;
import com.twelveweekyear.feature.feedback.dto.FeedbackResponse;
import com.twelveweekyear.feature.feedback.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** Stores feedback. {@code userId} may be null for a guest submission. */
@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional
    public FeedbackResponse create(UUID userId, CreateFeedbackRequest request) {
        Feedback feedback = new Feedback();
        feedback.setUserId(userId);
        feedback.setMessage(request.message().trim());
        feedback.setRating(request.rating());
        feedbackRepository.save(feedback);
        return new FeedbackResponse(
                feedback.getId(), feedback.getMessage(), feedback.getRating(), feedback.getCreatedAt());
    }
}
