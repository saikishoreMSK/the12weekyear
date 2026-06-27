package com.twelveweekyear.feature.quarter.mapper;

import com.twelveweekyear.feature.quarter.domain.Goal;
import com.twelveweekyear.feature.quarter.domain.GoalPace;
import com.twelveweekyear.feature.quarter.dto.GoalResponse;
import com.twelveweekyear.feature.quarter.support.QuarterMath;
import org.springframework.stereotype.Component;

/** Builds goal responses (with pacing) and human labels for quarters. */
@Component
public class QuarterMapper {

    private static final String[] MONTHS = {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    };

    /** Month-range label for a quarter, e.g. Q1 → "Jan – Mar". */
    public String label(int quarterNumber) {
        int startMonth = (quarterNumber - 1) * 3;
        return MONTHS[startMonth] + " – " + MONTHS[startMonth + 2];
    }

    /**
     * @param active     whether the quarter is currently active (pace is only meaningful then).
     * @param currentDay day-of-quarter (used for the expected-progress line); ignored when inactive.
     * @param totalDays  length of the quarter.
     */
    public GoalResponse toGoalResponse(Goal goal, boolean active, int currentDay, int totalDays) {
        int progressPercent = QuarterMath.progressPercent(goal.getCurrentValue(), goal.getTargetValue());
        GoalPace pace = active
                ? QuarterMath.pace(progressPercent, QuarterMath.expectedPercent(currentDay, totalDays))
                : null;
        return new GoalResponse(
                goal.getId(),
                goal.getCategory(),
                goal.getTitle(),
                goal.getUnit(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                progressPercent,
                goal.getWeekStart(),
                goal.getWeekEnd(),
                pace);
    }
}
