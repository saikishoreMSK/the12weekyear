package com.twelveweekyear.feature.cycle.repository;

import com.twelveweekyear.feature.cycle.domain.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {

    List<Goal> findByCycleIdOrderByCategoryAscCreatedAtAsc(UUID cycleId);

    Optional<Goal> findByIdAndCycleId(UUID id, UUID cycleId);

    long countByCycleId(UUID cycleId);

    void deleteByCycleId(UUID cycleId);
}
