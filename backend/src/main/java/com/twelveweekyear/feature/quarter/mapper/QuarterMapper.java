package com.twelveweekyear.feature.quarter.mapper;

import com.twelveweekyear.feature.quarter.domain.Goal;
import com.twelveweekyear.feature.quarter.domain.GoalStatus;
import com.twelveweekyear.feature.quarter.domain.QuarterState;
import com.twelveweekyear.feature.quarter.dto.GoalResponse;
import org.springframework.stereotype.Component;

/** Builds goal responses (with status) and human labels for quarters. */
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

    public GoalResponse toGoalResponse(Goal goal, QuarterState state, Integer currentWeek) {
        return new GoalResponse(goal.getId(), goal.getTitle(), goal.getWeek(), goal.isDone(),
                status(goal, state, currentWeek));
    }

    private GoalStatus status(Goal goal, QuarterState state, Integer currentWeek) {
        if (goal.isDone()) {
            return GoalStatus.DONE;
        }
        return switch (state) {
            case UPCOMING -> GoalStatus.UPCOMING;   // quarter hasn't started; nothing missed yet
            case COMPLETED -> GoalStatus.MISSED;    // quarter over; anything undone was missed
            case ACTIVE -> {
                if (currentWeek != null && goal.getWeek() == currentWeek) {
                    yield GoalStatus.THIS_WEEK;
                }
                yield (currentWeek != null && goal.getWeek() > currentWeek)
                        ? GoalStatus.UPCOMING
                        : GoalStatus.MISSED;
            }
        };
    }
}
