package com.twelveweekyear.feature.feedback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * A piece of user (or guest) feedback. Immutable once submitted; {@code userId} is null for guests
 * who leave feedback without an account. Surfaced in the web admin panel.
 */
@Entity
@Table(name = "feedback", indexes = {
        @Index(name = "idx_feedback_user", columnList = "user_id"),
        @Index(name = "idx_feedback_created", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Null when submitted by a guest (no account). */
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false, length = 2000)
    private String message;

    /** Optional 1–5 star rating. */
    @Column
    private Integer rating;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
