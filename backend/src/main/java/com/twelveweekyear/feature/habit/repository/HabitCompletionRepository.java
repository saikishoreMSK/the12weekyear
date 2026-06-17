package com.twelveweekyear.feature.habit.repository;

import com.twelveweekyear.feature.habit.domain.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, UUID> {

    List<HabitCompletion> findByHabitId(UUID habitId);

    List<HabitCompletion> findByHabitIdIn(Collection<UUID> habitIds);

    Optional<HabitCompletion> findByHabitIdAndCompletionDate(UUID habitId, LocalDate completionDate);

    boolean existsByHabitIdAndCompletionDate(UUID habitId, LocalDate completionDate);

    void deleteByHabitId(UUID habitId);
}
