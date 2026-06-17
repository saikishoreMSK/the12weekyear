package com.twelveweekyear.feature.user.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.feature.user.domain.User;
import com.twelveweekyear.feature.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

/**
 * Resolves "today" in a user's own timezone — the day boundary that cycle progress, habit
 * streaks and completion stats are all computed against.
 */
@Service
public class UserTimeService {

    private final UserRepository userRepository;

    public UserTimeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LocalDate today(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User not found"));
        return LocalDate.now(ZoneId.of(user.getTimezone()));
    }
}
