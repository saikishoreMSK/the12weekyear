package com.twelveweekyear.feature.feedback.dto;

import java.time.Instant;
import java.util.UUID;

public record FeedbackResponse(UUID id, String message, Integer rating, Instant createdAt) {
}
