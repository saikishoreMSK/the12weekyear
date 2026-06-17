package com.twelveweekyear.feature.cycle.repository;

import com.twelveweekyear.feature.cycle.domain.Cycle;
import com.twelveweekyear.feature.cycle.domain.CycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CycleRepository extends JpaRepository<Cycle, UUID> {

    List<Cycle> findByUserIdOrderByStartDateDesc(UUID userId);

    Optional<Cycle> findByIdAndUserId(UUID id, UUID userId);

    /** Most recent active cycle — the candidate for "current". */
    Optional<Cycle> findFirstByUserIdAndStatusOrderByStartDateDesc(UUID userId, CycleStatus status);
}
