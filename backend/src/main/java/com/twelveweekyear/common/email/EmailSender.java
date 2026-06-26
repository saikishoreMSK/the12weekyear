package com.twelveweekyear.common.email;

/** Sends a transactional email. Implementation is chosen by {@code app.email.provider}. */
public interface EmailSender {

    void send(String to, String subject, String htmlBody);
}
