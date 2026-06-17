package com.twelveweekyear.feature.user.mapper;

import com.twelveweekyear.feature.user.domain.User;
import com.twelveweekyear.feature.user.dto.UserResponse;
import org.springframework.stereotype.Component;

/** Maps {@link User} entities to their public {@link UserResponse} projection. */
@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getTimezone(),
                user.getCreatedAt());
    }
}
