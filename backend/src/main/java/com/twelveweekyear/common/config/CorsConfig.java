package com.twelveweekyear.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS policy for browser clients, exposed as a {@link CorsConfigurationSource} bean so the Spring
 * Security filter chain applies it (including preflight requests). Native mobile clients are
 * unaffected by CORS.
 *
 * <p>Production origins are externalised ({@code app.cors.allowed-origins}) so the deployed API
 * locks down to the real web domain without a code change. Local dev tooling (the Next.js dev
 * server and the Expo web preview, whose port varies) is always allowed via localhost patterns so
 * developers can hit the API from a browser without editing env vars. Native mobile clients
 * (Expo Go / installed app) are unaffected by CORS entirely.
 */
@Configuration
public class CorsConfig {

    /** Local development origins, allowed on any port (Next dev :3000, Expo web :8081/:8082, …). */
    private static final List<String> LOCAL_DEV_ORIGIN_PATTERNS =
            List.of("http://localhost:*", "http://127.0.0.1:*");

    private final List<String> allowedOrigins;

    public CorsConfig(@Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedOriginPatterns(LOCAL_DEV_ORIGIN_PATTERNS);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
