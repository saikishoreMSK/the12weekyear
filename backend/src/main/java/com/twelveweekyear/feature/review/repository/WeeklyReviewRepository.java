package com.twelveweekyear.feature.review.repository;

import com.twelveweekyear.feature.review.domain.WeeklyReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeeklyReviewRepository extends JpaRepository<WeeklyReview, UUID> {

    List<WeeklyReview> findByCycleIdOrderByWeekNumberAsc(UUID cycleId);

    Optional<WeeklyReview> findByCycleIdAndWeekNumber(UUID cycleId, int weekNumber);

    void deleteByCycleId(UUID cycleId);
}
