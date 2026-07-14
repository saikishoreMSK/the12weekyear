package com.twelveweekyear.feature.habit.repository;

import com.twelveweekyear.feature.habit.domain.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitRepository extends JpaRepository<Habit, UUID> {

    List<Habit> findByUserIdOrderByCreatedAtAsc(UUID userId);

    Optional<Habit> findByIdAndUserId(UUID id, UUID userId);

    void deleteByUserId(UUID userId);
}
