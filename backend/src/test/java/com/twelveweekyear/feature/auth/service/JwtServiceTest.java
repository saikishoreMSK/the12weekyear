package com.twelveweekyear.feature.auth.service;

import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.auth.config.AuthProperties;
import com.twelveweekyear.feature.user.domain.User;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private final AuthProperties properties = new AuthProperties(
            "test-secret-test-secret-test-secret-0123456789",
            Duration.ofMinutes(15),
            Duration.ofDays(30));
    private final JwtService jwtService = new JwtService(properties);

    private User user(UUID id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        return user;
    }

    @Test
    void generatesTokenThatParsesBackToTheSamePrincipal() {
        UUID id = UUID.randomUUID();
        String token = jwtService.generateAccessToken(user(id, "alice@example.com"));

        Optional<AuthUser> parsed = jwtService.parse(token);

        assertThat(parsed).isPresent();
        assertThat(parsed.get().id()).isEqualTo(id);
        assertThat(parsed.get().email()).isEqualTo("alice@example.com");
    }

    @Test
    void rejectsGarbageToken() {
        assertThat(jwtService.parse("not-a-jwt")).isEmpty();
    }

    @Test
    void rejectsTokenSignedWithADifferentSecret() {
        AuthProperties other = new AuthProperties(
                "another-secret-another-secret-another-99", Duration.ofMinutes(15), Duration.ofDays(30));
        String foreignToken = new JwtService(other).generateAccessToken(user(UUID.randomUUID(), "eve@example.com"));

        assertThat(jwtService.parse(foreignToken)).isEmpty();
    }
}
