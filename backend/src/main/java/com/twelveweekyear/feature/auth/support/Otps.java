package com.twelveweekyear.feature.auth.support;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

/** Pure helpers for OTP generation, hashing, expiry and cooldown math. */
public final class Otps {

    private Otps() {
    }

    /** A zero-padded numeric code of the given length, e.g. {@code "048213"}. */
    public static String generateCode(int length, SecureRandom random) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    /** SHA-256 hex of the code — codes are stored hashed, never in plaintext. */
    public static String hash(String code) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(code.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }

    /** True once {@code now} has reached or passed {@code expiresAt}. */
    public static boolean isExpired(Instant expiresAt, Instant now) {
        return !now.isBefore(expiresAt);
    }

    /** Seconds the caller must still wait before another code may be requested (0 if none). */
    public static long cooldownSecondsRemaining(Instant lastCreatedAt, Duration cooldown, Instant now) {
        long remaining = Duration.between(now, lastCreatedAt.plus(cooldown)).getSeconds();
        return Math.max(0, remaining);
    }
}
