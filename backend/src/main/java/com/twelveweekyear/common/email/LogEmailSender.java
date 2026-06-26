package com.twelveweekyear.common.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Development email sender: logs the message instead of sending it. The OTP appears in the server
 * console, so the whole flow can be tested without an email provider.
 */
public class LogEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LogEmailSender.class);

    @Override
    public void send(String to, String subject, String htmlBody) {
        log.info("""
                [DEV EMAIL] (set app.email.provider=resend to send for real)
                  to:      {}
                  subject: {}
                  body:    {}""", to, subject, htmlBody);
    }
}
