package com.twelveweekyear.feature.habit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * The fact that a habit was completed on a given local date. Presence of the row means "done";
 * un-completing simply deletes it. The unique constraint guarantees at most one row per day.
 */
@Entity
@Table(
        name = "habit_completions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_habit_completion_day",
                columnNames = {"habit_id", "completion_date"}),
        indexes = @Index(name = "idx_habit_completion_habit", columnList = "habit_id"))
public class HabitCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "habit_id", nullable = false)
    private UUID habitId;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getHabitId() {
        return habitId;
    }

    public void setHabitId(UUID habitId) {
        this.habitId = habitId;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
