package com.twelveweekyear.feature.auth.service;

import com.twelveweekyear.common.security.AuthUser;
import com.twelveweekyear.feature.auth.config.AuthProperties;
import com.twelveweekyear.feature.user.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

/**
 * Issues and verifies stateless HS256 access tokens. The token's subject is the user id and it
 * carries the email as a claim — enough for the filter to build an {@link AuthUser} without a DB
 * lookup on every request.
 */
@Service
public class JwtService {

    private static final String CLAIM_EMAIL = "email";

    private final SecretKey signingKey;
    private final AuthProperties properties;

    public JwtService(AuthProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(properties.jwtSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(properties.accessTokenTtl());
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim(CLAIM_EMAIL, user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    /** Parses and validates a token, returning the principal, or empty if invalid/expired. */
    public Optional<AuthUser> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            UUID userId = UUID.fromString(claims.getSubject());
            String email = claims.get(CLAIM_EMAIL, String.class);
            return Optional.of(new AuthUser(userId, email));
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public long accessTokenTtlSeconds() {
        return properties.accessTokenTtl().toSeconds();
    }
}
