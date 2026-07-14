package com.twelveweekyear.feature.feedback.repository;

import com.twelveweekyear.feature.feedback.domain.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    void deleteByUserId(UUID userId);
}
