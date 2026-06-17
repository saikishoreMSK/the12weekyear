package com.twelveweekyear.feature.auth.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.feature.auth.dto.AuthResponse;
import com.twelveweekyear.feature.auth.dto.LoginRequest;
import com.twelveweekyear.feature.auth.dto.RegisterRequest;
import com.twelveweekyear.feature.user.domain.User;
import com.twelveweekyear.feature.user.mapper.UserMapper;
import com.twelveweekyear.feature.user.repository.UserRepository;
import com.twelveweekyear.feature.user.support.Timezones;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Account lifecycle: registration, login, token refresh, and logout. */
@Service
public class AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository,
                       RefreshTokenService refreshTokenService,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.CONFLICT, "An account with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName().trim());
        user.setTimezone(Timezones.validate(request.timezone()));
        userRepository.save(user);

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // One generic message for "no such user" and "wrong password" to avoid account enumeration.
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Invalid email or password"));

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshTokenService.Rotation rotation = refreshTokenService.rotate(refreshToken);
        User user = userRepository.findById(rotation.userId())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Invalid refresh token"));

        return new AuthResponse(
                jwtService.generateAccessToken(user),
                rotation.rawToken(),
                TOKEN_TYPE,
                jwtService.accessTokenTtlSeconds(),
                userMapper.toResponse(user));
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    private AuthResponse issueTokens(User user) {
        return new AuthResponse(
                jwtService.generateAccessToken(user),
                refreshTokenService.issue(user.getId()),
                TOKEN_TYPE,
                jwtService.accessTokenTtlSeconds(),
                userMapper.toResponse(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
