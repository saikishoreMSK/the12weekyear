package com.twelveweekyear.feature.auth.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.feature.auth.domain.OtpPurpose;
import com.twelveweekyear.feature.auth.dto.AuthResponse;
import com.twelveweekyear.feature.auth.dto.LoginRequest;
import com.twelveweekyear.feature.auth.dto.RegisterRequest;
import com.twelveweekyear.feature.auth.dto.RegistrationResponse;
import com.twelveweekyear.feature.user.domain.User;
import com.twelveweekyear.feature.user.mapper.UserMapper;
import com.twelveweekyear.feature.user.repository.UserRepository;
import com.twelveweekyear.feature.user.support.Timezones;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/** Account lifecycle: registration, email verification, login, OTP resend, and password reset. */
@Service
public class AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository,
                       RefreshTokenService refreshTokenService,
                       JwtService jwtService,
                       OtpService otpService,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Transactional
    public RegistrationResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.CONFLICT, "An account with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName().trim());
        user.setTimezone(Timezones.validate(request.timezone()));
        user.setEmailVerified(false); // must verify via OTP before signing in
        userRepository.save(user);

        otpService.sendCode(user, OtpPurpose.EMAIL_VERIFICATION);
        return new RegistrationResponse(email, true);
    }

    @Transactional
    public AuthResponse verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Invalid code"));
        otpService.verify(user, OtpPurpose.EMAIL_VERIFICATION, code);
        user.setEmailVerified(true);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // One generic message for "no such user" and "wrong password" to avoid account enumeration.
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Invalid email or password"));

        if (!user.isEmailVerified()) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED, "Please verify your email to continue");
        }
        return issueTokens(user);
    }

    /** Resend an OTP. Always succeeds generically (no account-enumeration); honours the cooldown. */
    @Transactional
    public void resendOtp(String email, OtpPurpose purpose) {
        Optional<User> user = userRepository.findByEmail(normalizeEmail(email));
        if (user.isEmpty()) {
            return;
        }
        // Don't re-send a verification code to an already-verified account.
        if (purpose == OtpPurpose.EMAIL_VERIFICATION && user.get().isEmailVerified()) {
            return;
        }
        otpService.sendCode(user.get(), purpose);
    }

    /** Start a password reset. Always returns normally so the response can't reveal if the email exists. */
    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(normalizeEmail(email))
                .ifPresent(user -> otpService.sendCode(user, OtpPurpose.PASSWORD_RESET));
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Invalid code"));
        otpService.verify(user, OtpPurpose.PASSWORD_RESET, code);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        // A reset implies the account may be compromised — invalidate all existing sessions.
        refreshTokenService.revokeAll(user.getId());
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
