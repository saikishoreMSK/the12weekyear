package com.twelveweekyear.feature.quarter.repository;

import com.twelveweekyear.feature.quarter.domain.Quarter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuarterRepository extends JpaRepository<Quarter, UUID> {

    Optional<Quarter> findByIdAndUserId(UUID id, UUID userId);

    List<Quarter> findByUserIdAndYearOrderByQuarterNumberAsc(UUID userId, int year);

    Optional<Quarter> findByUserIdAndYearAndQuarterNumber(UUID userId, int year, int quarterNumber);

    boolean existsByUserIdAndYearAndQuarterNumber(UUID userId, int year, int quarterNumber);
}
