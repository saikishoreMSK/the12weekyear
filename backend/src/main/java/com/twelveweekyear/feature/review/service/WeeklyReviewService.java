package com.twelveweekyear.feature.review.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.common.exception.ResourceNotFoundException;
import com.twelveweekyear.feature.cycle.domain.Cycle;
import com.twelveweekyear.feature.cycle.service.CycleService;
import com.twelveweekyear.feature.review.domain.WeeklyReview;
import com.twelveweekyear.feature.review.dto.WeeklyReviewRequest;
import com.twelveweekyear.feature.review.dto.WeeklyReviewResponse;
import com.twelveweekyear.feature.review.mapper.WeeklyReviewMapper;
import com.twelveweekyear.feature.review.repository.WeeklyReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Weekly reviews for a cycle. Upsert by week; never deleted individually (answers are permanent). */
@Service
public class WeeklyReviewService {

    private final CycleService cycleService;
    private final WeeklyReviewRepository reviewRepository;
    private final WeeklyReviewMapper reviewMapper;

    public WeeklyReviewService(CycleService cycleService,
                               WeeklyReviewRepository reviewRepository,
                               WeeklyReviewMapper reviewMapper) {
        this.cycleService = cycleService;
        this.reviewRepository = reviewRepository;
        this.reviewMapper = reviewMapper;
    }

    @Transactional(readOnly = true)
    public List<WeeklyReviewResponse> list(UUID userId, UUID cycleId) {
        cycleService.requireOwnedCycle(userId, cycleId);
        return reviewRepository.findByCycleIdOrderByWeekNumberAsc(cycleId).stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WeeklyReviewResponse get(UUID userId, UUID cycleId, int weekNumber) {
        cycleService.requireOwnedCycle(userId, cycleId);
        return reviewRepository.findByCycleIdAndWeekNumber(cycleId, weekNumber)
                .map(reviewMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No review for this week yet"));
    }

    @Transactional
    public WeeklyReviewResponse upsert(UUID userId, UUID cycleId, int weekNumber, WeeklyReviewRequest request) {
        cycleService.requireOwnedCycle(userId, cycleId);
        if (weekNumber < 1 || weekNumber > Cycle.TOTAL_WEEKS) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Week number must be between 1 and " + Cycle.TOTAL_WEEKS);
        }

        WeeklyReview review = reviewRepository.findByCycleIdAndWeekNumber(cycleId, weekNumber)
                .orElseGet(() -> {
                    WeeklyReview created = new WeeklyReview();
                    created.setUserId(userId);
                    created.setCycleId(cycleId);
                    created.setWeekNumber(weekNumber);
                    return created;
                });

        review.setWentWell(blankToNull(request.wentWell()));
        review.setWastedTime(blankToNull(request.wastedTime()));
        review.setBiggestWin(blankToNull(request.biggestWin()));
        review.setBiggestBlocker(blankToNull(request.biggestBlocker()));

        reviewRepository.save(review);
        return reviewMapper.toResponse(review);
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
