package com.twelveweekyear.common.email;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Sends email via the Resend HTTP API (https://resend.com). Uses HTTPS, so it works on hosts that
 * block outbound SMTP (e.g. Render's free tier).
 */
public class ResendEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailSender.class);
    private static final String ENDPOINT = "https://api.resend.com/emails";

    private final RestClient restClient;
    private final String from;

    public ResendEmailSender(String apiKey, String from) {
        this.from = from;
        this.restClient = RestClient.builder()
                .baseUrl(ENDPOINT)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
    }

    @Override
    public void send(String to, String subject, String htmlBody) {
        try {
            restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "from", from,
                            "to", List.of(to),
                            "subject", subject,
                            "html", htmlBody))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException ex) {
            log.error("Failed to send email via Resend to {}", to, ex);
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Could not send email. Please try again.");
        }
    }
}
