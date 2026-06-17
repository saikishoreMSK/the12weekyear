package com.twelveweekyear.feature.user.service;

import com.twelveweekyear.common.exception.ResourceNotFoundException;
import com.twelveweekyear.feature.user.domain.User;
import com.twelveweekyear.feature.user.dto.UpdateProfileRequest;
import com.twelveweekyear.feature.user.dto.UserResponse;
import com.twelveweekyear.feature.user.mapper.UserMapper;
import com.twelveweekyear.feature.user.repository.UserRepository;
import com.twelveweekyear.feature.user.support.Timezones;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** Read/update operations on the authenticated user's own profile. */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID userId) {
        return userMapper.toResponse(getOrThrow(userId));
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = getOrThrow(userId);
        user.setDisplayName(request.displayName());
        user.setTimezone(Timezones.validate(request.timezone()));
        // updated_at is set by JPA auditing on flush.
        return userMapper.toResponse(user);
    }

    private User getOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
