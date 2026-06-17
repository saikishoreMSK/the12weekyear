package com.twelveweekyear.feature.cycle.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * A 12-week execution cycle (the "12 Week Year"): a fixed 84-day window with one overarching
 * objective, broken into {@link Goal}s.
 *
 * <p>Only {@code startDate} is stored; {@code endDate}, the current day (1..84) and the current
 * week (1..12) are derived at read time so they always reflect "now" in the user's timezone.
 */
@Entity
@Table(name = "cycles", indexes = {
        @Index(name = "idx_cycle_user", columnList = "user_id")
})
@EntityListeners(AuditingEntityListener.class)
public class Cycle {

    /** A cycle is always 12 weeks / 84 days. */
    public static final int TOTAL_WEEKS = 12;
    public static final int TOTAL_DAYS = TOTAL_WEEKS * 7;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 120)
    private String title;

    /** The quarterly goal statement (free text); optional. */
    @Column(length = 2000)
    private String objective;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CycleStatus status;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Inclusive last day of the cycle. */
    public LocalDate endDate() {
        return startDate.plusDays(TOTAL_DAYS - 1L);
    }

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getObjective() {
        return objective;
    }

    public void setObjective(String objective) {
        this.objective = objective;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public CycleStatus getStatus() {
        return status;
    }

    public void setStatus(CycleStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
