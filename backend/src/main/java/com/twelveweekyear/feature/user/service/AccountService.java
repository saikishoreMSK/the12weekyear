package com.twelveweekyear.feature.user.service;

import com.twelveweekyear.feature.auth.repository.OtpVerificationRepository;
import com.twelveweekyear.feature.auth.repository.RefreshTokenRepository;
import com.twelveweekyear.feature.feedback.repository.FeedbackRepository;
import com.twelveweekyear.feature.habit.domain.Habit;
import com.twelveweekyear.feature.habit.repository.HabitCompletionRepository;
import com.twelveweekyear.feature.habit.repository.HabitRepository;
import com.twelveweekyear.feature.quarter.domain.Quarter;
import com.twelveweekyear.feature.quarter.repository.GoalRepository;
import com.twelveweekyear.feature.quarter.repository.QuarterRepository;
import com.twelveweekyear.feature.review.repository.WeeklyReviewRepository;
import com.twelveweekyear.feature.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Permanently deletes a user's account and ALL of their data (habits, completions, quarters, goals,
 * reviews, feedback, tokens). Satisfies the app-store account-deletion requirement. There are no DB
 * foreign keys, so children are removed before their parents explicitly.
 */
@Service
public class AccountService {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final QuarterRepository quarterRepository;
    private final GoalRepository goalRepository;
    private final WeeklyReviewRepository reviewRepository;
    private final FeedbackRepository feedbackRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpVerificationRepository otpVerificationRepository;

    public AccountService(UserRepository userRepository,
                          HabitRepository habitRepository,
                          HabitCompletionRepository habitCompletionRepository,
                          QuarterRepository quarterRepository,
                          GoalRepository goalRepository,
                          WeeklyReviewRepository reviewRepository,
                          FeedbackRepository feedbackRepository,
                          RefreshTokenRepository refreshTokenRepository,
                          OtpVerificationRepository otpVerificationRepository) {
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
        this.habitCompletionRepository = habitCompletionRepository;
        this.quarterRepository = quarterRepository;
        this.goalRepository = goalRepository;
        this.reviewRepository = reviewRepository;
        this.feedbackRepository = feedbackRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpVerificationRepository = otpVerificationRepository;
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        for (Habit habit : habitRepository.findByUserIdOrderByCreatedAtAsc(userId)) {
            habitCompletionRepository.deleteByHabitId(habit.getId());
        }
        habitRepository.deleteByUserId(userId);

        for (Quarter quarter : quarterRepository.findByUserId(userId)) {
            goalRepository.deleteByQuarterId(quarter.getId());
            reviewRepository.deleteByQuarterId(quarter.getId());
        }
        quarterRepository.deleteByUserId(userId);

        feedbackRepository.deleteByUserId(userId);
        refreshTokenRepository.deleteByUserId(userId);
        otpVerificationRepository.deleteByUserId(userId);

        userRepository.deleteById(userId);
    }
}
