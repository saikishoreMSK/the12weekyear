package com.twelveweekyear.common.email;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Picks the {@link EmailSender} from {@code app.email.provider}: "resend" uses the HTTP API,
 * anything else (the default) logs to the console for local development.
 */
@Configuration
public class MailConfig {

    @Bean
    @ConditionalOnProperty(prefix = "app.email", name = "provider", havingValue = "resend")
    public EmailSender resendEmailSender(EmailProperties properties) {
        return new ResendEmailSender(properties.resendApiKey(), properties.from());
    }

    @Bean
    @ConditionalOnMissingBean(EmailSender.class)
    public EmailSender logEmailSender() {
        return new LogEmailSender();
    }
}
