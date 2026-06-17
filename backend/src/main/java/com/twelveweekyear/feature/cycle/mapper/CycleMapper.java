package com.twelveweekyear.feature.cycle.mapper;

import com.twelveweekyear.feature.cycle.domain.Cycle;
import com.twelveweekyear.feature.cycle.domain.Goal;
import com.twelveweekyear.feature.cycle.dto.CycleResponse;
import com.twelveweekyear.feature.cycle.dto.CycleSummaryResponse;
import com.twelveweekyear.feature.cycle.dto.GoalResponse;
import com.twelveweekyear.feature.cycle.support.CycleMath;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/** Builds cycle/goal response DTOs, computing the time-relative fields against {@code today}. */
@Component
public class CycleMapper {

    public GoalResponse toGoalResponse(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getCategory(),
                goal.getTitle(),
                goal.getUnit(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                CycleMath.progressPercent(goal.getCurrentValue(), goal.getTargetValue()),
                goal.getWeekStart(),
                goal.getWeekEnd());
    }

    public CycleResponse toCycleResponse(Cycle cycle, List<Goal> goals, LocalDate today) {
        CycleMath.Progress progress = CycleMath.progress(cycle.getStartDate(), today);
        return new CycleResponse(
                cycle.getId(),
                cycle.getTitle(),
                cycle.getObjective(),
                cycle.getStatus(),
                cycle.getStartDate(),
                cycle.endDate(),
                Cycle.TOTAL_DAYS,
                Cycle.TOTAL_WEEKS,
                progress.currentDay(),
                progress.currentWeek(),
                goals.stream().map(this::toGoalResponse).toList());
    }

    public CycleSummaryResponse toSummaryResponse(Cycle cycle, long goalCount, LocalDate today) {
        CycleMath.Progress progress = CycleMath.progress(cycle.getStartDate(), today);
        return new CycleSummaryResponse(
                cycle.getId(),
                cycle.getTitle(),
                cycle.getStatus(),
                cycle.getStartDate(),
                cycle.endDate(),
                progress.currentDay(),
                progress.currentWeek(),
                Cycle.TOTAL_DAYS,
                goalCount);
    }
}
