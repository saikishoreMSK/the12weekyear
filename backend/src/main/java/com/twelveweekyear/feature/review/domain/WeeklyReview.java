package com.twelveweekyear.feature.review.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * A reflection for one week of a cycle. Keyed by {@code (cycleId, weekNumber)} — at most one per
 * week. {@code userId} is denormalised so future analytics can scan all of a user's reviews for
 * recurring patterns without joining through cycles.
 */
@Entity
@Table(
        name = "weekly_reviews",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_review_cycle_week",
                columnNames = {"cycle_id", "week_number"}),
        indexes = {
                @Index(name = "idx_review_cycle", columnList = "cycle_id"),
                @Index(name = "idx_review_user", columnList = "user_id")
        })
@EntityListeners(AuditingEntityListener.class)
public class WeeklyReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "cycle_id", nullable = false)
    private UUID cycleId;

    @Column(name = "week_number", nullable = false)
    private int weekNumber;

    @Column(name = "went_well", length = 2000)
    private String wentWell;

    @Column(name = "wasted_time", length = 2000)
    private String wastedTime;

    @Column(name = "biggest_win", length = 2000)
    private String biggestWin;

    @Column(name = "biggest_blocker", length = 2000)
    private String biggestBlocker;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

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

    public UUID getCycleId() {
        return cycleId;
    }

    public void setCycleId(UUID cycleId) {
        this.cycleId = cycleId;
    }

    public int getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(int weekNumber) {
        this.weekNumber = weekNumber;
    }

    public String getWentWell() {
        return wentWell;
    }

    public void setWentWell(String wentWell) {
        this.wentWell = wentWell;
    }

    public String getWastedTime() {
        return wastedTime;
    }

    public void setWastedTime(String wastedTime) {
        this.wastedTime = wastedTime;
    }

    public String getBiggestWin() {
        return biggestWin;
    }

    public void setBiggestWin(String biggestWin) {
        this.biggestWin = biggestWin;
    }

    public String getBiggestBlocker() {
        return biggestBlocker;
    }

    public void setBiggestBlocker(String biggestBlocker) {
        this.biggestBlocker = biggestBlocker;
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
