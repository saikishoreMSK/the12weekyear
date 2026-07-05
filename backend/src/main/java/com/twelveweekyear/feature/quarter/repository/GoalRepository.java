package com.twelveweekyear.feature.quarter.repository;

import com.twelveweekyear.feature.quarter.domain.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {

    List<Goal> findByQuarterIdOrderByWeekAsc(UUID quarterId);

    Optional<Goal> findByIdAndQuarterId(UUID id, UUID quarterId);

    boolean existsByQuarterIdAndWeek(UUID quarterId, int week);

    long countByQuarterId(UUID quarterId);

    void deleteByQuarterId(UUID quarterId);
}
