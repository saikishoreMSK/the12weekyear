package com.twelveweekyear.feature.auth.service;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.feature.auth.config.AuthProperties;
import com.twelveweekyear.feature.auth.domain.RefreshToken;
import com.twelveweekyear.feature.auth.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Manages opaque, rotating refresh tokens. The raw token is a 256-bit random string returned to
 * the client; only its SHA-256 hash is persisted. Each use rotates the token (old revoked, new
 * issued); presenting a revoked token is treated as theft and revokes the user's whole family.
 */
@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    private final RefreshTokenRepository repository;
    private final AuthProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository, AuthProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    /** The userId and the freshly minted raw refresh token to hand back to the client. */
    public record Rotation(UUID userId, String rawToken) {
    }

    @Transactional
    public String issue(UUID userId) {
        String rawToken = generateRawToken();
        RefreshToken entity = new RefreshToken();
        entity.setUserId(userId);
        entity.setTokenHash(hash(rawToken));
        entity.setExpiresAt(Instant.now().plus(properties.refreshTokenTtl()));
        entity.setRevoked(false);
        entity.setCreatedAt(Instant.now());
        repository.save(entity);
        return rawToken;
    }

    @Transactional
    public Rotation rotate(String rawToken) {
        RefreshToken token = repository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Invalid refresh token"));

        if (token.isRevoked()) {
            // A revoked token being presented again signals theft/replay — burn the whole family.
            log.warn("Refresh token reuse detected for user {}; revoking all tokens", token.getUserId());
            repository.revokeAllForUser(token.getUserId());
            throw new AppException(ErrorCode.UNAUTHORIZED, "Invalid refresh token");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Refresh token expired");
        }

        token.setRevoked(true);
        UUID userId = token.getUserId();
        return new Rotation(userId, issue(userId));
    }

    @Transactional
    public void revoke(String rawToken) {
        // Idempotent: unknown tokens are a no-op so logout never errors.
        repository.findByTokenHash(hash(rawToken)).ifPresent(token -> token.setRevoked(true));
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (java.security.NoSuchAlgorithmException ex) {
            // SHA-256 is mandated by the JLS to be present; this cannot happen.
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}
