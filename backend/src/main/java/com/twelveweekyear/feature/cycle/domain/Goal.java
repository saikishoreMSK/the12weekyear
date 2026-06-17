package com.twelveweekyear.feature.cycle.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * A measurable target within a {@link Cycle} (e.g. "Solve 28 DSA problems", "Project 100%").
 * Tracked by {@code currentValue} against {@code targetValue}; assigned to a week range
 * {@code weekStart}..{@code weekEnd} within the cycle.
 */
@Entity
@Table(name = "goals", indexes = {
        @Index(name = "idx_goal_cycle", columnList = "cycle_id")
})
@EntityListeners(AuditingEntityListener.class)
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "cycle_id", nullable = false)
    private UUID cycleId;

    /** Free-form grouping label, e.g. "DSA", "System Design", "Fitness". */
    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 120)
    private String title;

    /** Unit of the target, e.g. "problems", "hours", "applications", "%". */
    @Column(nullable = false, length = 30)
    private String unit;

    @Column(name = "target_value", nullable = false)
    private int targetValue;

    @Column(name = "current_value", nullable = false)
    private int currentValue;

    /** Week of the cycle this goal starts in (1..12). */
    @Column(name = "week_start", nullable = false)
    private int weekStart;

    /** Week of the cycle this goal ends in (1..12, >= weekStart). */
    @Column(name = "week_end", nullable = false)
    private int weekEnd;

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

    public UUID getCycleId() {
        return cycleId;
    }

    public void setCycleId(UUID cycleId) {
        this.cycleId = cycleId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public int getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(int targetValue) {
        this.targetValue = targetValue;
    }

    public int getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(int currentValue) {
        this.currentValue = currentValue;
    }

    public int getWeekStart() {
        return weekStart;
    }

    public void setWeekStart(int weekStart) {
        this.weekStart = weekStart;
    }

    public int getWeekEnd() {
        return weekEnd;
    }

    public void setWeekEnd(int weekEnd) {
        this.weekEnd = weekEnd;
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
