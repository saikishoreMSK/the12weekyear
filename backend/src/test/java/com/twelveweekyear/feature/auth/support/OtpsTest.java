package com.twelveweekyear.feature.auth.support;

import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class OtpsTest {

    private final SecureRandom random = new SecureRandom();

    @Test
    void generatesNumericCodeOfRequestedLength() {
        String code = Otps.generateCode(6, random);
        assertThat(code).hasSize(6).containsPattern("^[0-9]{6}$");
    }

    @Test
    void hashIsDeterministicAndDistinguishesCodes() {
        assertThat(Otps.hash("123456")).isEqualTo(Otps.hash("123456"));
        assertThat(Otps.hash("123456")).isNotEqualTo(Otps.hash("654321"));
    }

    @Test
    void expiryBoundaryIsInclusive() {
        Instant expires = Instant.parse("2026-06-16T10:05:00Z");
        assertThat(Otps.isExpired(expires, expires.minusSeconds(1))).isFalse();
        assertThat(Otps.isExpired(expires, expires)).isTrue();
        assertThat(Otps.isExpired(expires, expires.plusSeconds(1))).isTrue();
    }

    @Test
    void cooldownCountsDownToZero() {
        Instant created = Instant.parse("2026-06-16T10:00:00Z");
        Duration cooldown = Duration.ofSeconds(120);
        assertThat(Otps.cooldownSecondsRemaining(created, cooldown, created)).isEqualTo(120);
        assertThat(Otps.cooldownSecondsRemaining(created, cooldown, created.plusSeconds(100))).isEqualTo(20);
        assertThat(Otps.cooldownSecondsRemaining(created, cooldown, created.plusSeconds(120))).isZero();
        assertThat(Otps.cooldownSecondsRemaining(created, cooldown, created.plusSeconds(200))).isZero();
    }
}
