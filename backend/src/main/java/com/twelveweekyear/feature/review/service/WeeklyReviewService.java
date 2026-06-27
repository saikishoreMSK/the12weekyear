package com.twelveweekyear.feature.review.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.common.exception.ResourceNotFoundException;
import com.twelveweekyear.feature.quarter.domain.Quarter;
import com.twelveweekyear.feature.quarter.service.QuarterService;
import com.twelveweekyear.feature.quarter.support.QuarterMath;
import com.twelveweekyear.feature.review.domain.WeeklyReview;
import com.twelveweekyear.feature.review.dto.WeeklyReviewRequest;
import com.twelveweekyear.feature.review.dto.WeeklyReviewResponse;
import com.twelveweekyear.feature.review.mapper.WeeklyReviewMapper;
import com.twelveweekyear.feature.review.repository.WeeklyReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Weekly reviews for a quarter. Upsert by week; never deleted individually (answers are permanent). */
@Service
public class WeeklyReviewService {

    private final QuarterService quarterService;
    private final WeeklyReviewRepository reviewRepository;
    private final WeeklyReviewMapper reviewMapper;

    public WeeklyReviewService(QuarterService quarterService,
                               WeeklyReviewRepository reviewRepository,
                               WeeklyReviewMapper reviewMapper) {
        this.quarterService = quarterService;
        this.reviewRepository = reviewRepository;
        this.reviewMapper = reviewMapper;
    }

    @Transactional(readOnly = true)
    public List<WeeklyReviewResponse> list(UUID userId, UUID quarterId) {
        quarterService.requireOwnedQuarter(userId, quarterId);
        return reviewRepository.findByQuarterIdOrderByWeekNumberAsc(quarterId).stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WeeklyReviewResponse get(UUID userId, UUID quarterId, int weekNumber) {
        quarterService.requireOwnedQuarter(userId, quarterId);
        return reviewRepository.findByQuarterIdAndWeekNumber(quarterId, weekNumber)
                .map(reviewMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No review for this week yet"));
    }

    @Transactional
    public WeeklyReviewResponse upsert(UUID userId, UUID quarterId, int weekNumber, WeeklyReviewRequest request) {
        Quarter quarter = quarterService.requireOwnedQuarter(userId, quarterId);
        int totalWeeks = QuarterMath.totalWeeks(
                QuarterMath.bounds(quarter.getYear(), quarter.getQuarterNumber()).totalDays());
        if (weekNumber < 1 || weekNumber > totalWeeks) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Week number must be between 1 and " + totalWeeks);
        }

        WeeklyReview review = reviewRepository.findByQuarterIdAndWeekNumber(quarterId, weekNumber)
                .orElseGet(() -> {
                    WeeklyReview created = new WeeklyReview();
                    created.setUserId(userId);
                    created.setQuarterId(quarterId);
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
