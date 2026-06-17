package com.twelveweekyear.feature.review.mapper;

import com.twelveweekyear.feature.review.domain.WeeklyReview;
import com.twelveweekyear.feature.review.dto.WeeklyReviewResponse;
import org.springframework.stereotype.Component;

@Component
public class WeeklyReviewMapper {

    public WeeklyReviewResponse toResponse(WeeklyReview review) {
        return new WeeklyReviewResponse(
                review.getId(),
                review.getWeekNumber(),
                review.getWentWell(),
                review.getWastedTime(),
                review.getBiggestWin(),
                review.getBiggestBlocker(),
                review.getCreatedAt(),
                review.getUpdatedAt());
    }
}
