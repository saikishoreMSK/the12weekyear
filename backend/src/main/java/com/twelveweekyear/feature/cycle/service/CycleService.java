package com.twelveweekyear.feature.cycle.service;

import com.twelveweekyear.common.exception.ResourceNotFoundException;
import com.twelveweekyear.feature.cycle.domain.Cycle;
import com.twelveweekyear.feature.cycle.domain.CycleStatus;
import com.twelveweekyear.feature.cycle.domain.Goal;
import com.twelveweekyear.feature.cycle.dto.CreateCycleRequest;
import com.twelveweekyear.feature.cycle.dto.CycleResponse;
import com.twelveweekyear.feature.cycle.dto.CycleSummaryResponse;
import com.twelveweekyear.feature.cycle.dto.UpdateCycleRequest;
import com.twelveweekyear.feature.cycle.mapper.CycleMapper;
import com.twelveweekyear.feature.cycle.repository.CycleRepository;
import com.twelveweekyear.feature.cycle.repository.GoalRepository;
import com.twelveweekyear.feature.review.repository.WeeklyReviewRepository;
import com.twelveweekyear.feature.user.service.UserTimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Cycle lifecycle, always scoped to the owning user. "Today" is resolved in the user's timezone. */
@Service
public class CycleService {

    private final CycleRepository cycleRepository;
    private final GoalRepository goalRepository;
    private final WeeklyReviewRepository reviewRepository;
    private final UserTimeService userTimeService;
    private final CycleMapper cycleMapper;

    public CycleService(CycleRepository cycleRepository,
                        GoalRepository goalRepository,
                        WeeklyReviewRepository reviewRepository,
                        UserTimeService userTimeService,
                        CycleMapper cycleMapper) {
        this.cycleRepository = cycleRepository;
        this.goalRepository = goalRepository;
        this.reviewRepository = reviewRepository;
        this.userTimeService = userTimeService;
        this.cycleMapper = cycleMapper;
    }

    @Transactional
    public CycleResponse create(UUID userId, CreateCycleRequest request) {
        Cycle cycle = new Cycle();
        cycle.setUserId(userId);
        cycle.setTitle(request.title().trim());
        cycle.setObjective(request.objective());
        cycle.setStartDate(request.startDate());
        cycle.setStatus(CycleStatus.ACTIVE);
        cycleRepository.save(cycle);
        return cycleMapper.toCycleResponse(cycle, List.of(), today(userId));
    }

    @Transactional(readOnly = true)
    public List<CycleSummaryResponse> list(UUID userId) {
        LocalDate today = today(userId);
        return cycleRepository.findByUserIdOrderByStartDateDesc(userId).stream()
                .map(cycle -> cycleMapper.toSummaryResponse(
                        cycle, goalRepository.countByCycleId(cycle.getId()), today))
                .toList();
    }

    @Transactional(readOnly = true)
    public CycleResponse get(UUID userId, UUID cycleId) {
        Cycle cycle = requireOwnedCycle(userId, cycleId);
        return toDetail(cycle, userId);
    }

    @Transactional(readOnly = true)
    public CycleResponse getCurrent(UUID userId) {
        Cycle cycle = cycleRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(userId, CycleStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active cycle"));
        return toDetail(cycle, userId);
    }

    @Transactional
    public CycleResponse update(UUID userId, UUID cycleId, UpdateCycleRequest request) {
        Cycle cycle = requireOwnedCycle(userId, cycleId);
        cycle.setTitle(request.title().trim());
        cycle.setObjective(request.objective());
        cycle.setStatus(request.status());
        return toDetail(cycle, userId);
    }

    @Transactional
    public void delete(UUID userId, UUID cycleId) {
        Cycle cycle = requireOwnedCycle(userId, cycleId);
        goalRepository.deleteByCycleId(cycle.getId());
        reviewRepository.deleteByCycleId(cycle.getId());
        cycleRepository.delete(cycle);
    }

    /** Loads a cycle that must belong to the user, or 404 (never reveals another user's cycle). */
    public Cycle requireOwnedCycle(UUID userId, UUID cycleId) {
        return cycleRepository.findByIdAndUserId(cycleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle not found"));
    }

    private CycleResponse toDetail(Cycle cycle, UUID userId) {
        List<Goal> goals = goalRepository.findByCycleIdOrderByCategoryAscCreatedAtAsc(cycle.getId());
        return cycleMapper.toCycleResponse(cycle, goals, today(userId));
    }

    private LocalDate today(UUID userId) {
        return userTimeService.today(userId);
    }
}
