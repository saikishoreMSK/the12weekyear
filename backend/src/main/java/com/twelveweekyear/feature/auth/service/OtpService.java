package com.twelveweekyear.feature.auth.service;

import com.twelveweekyear.common.email.EmailSender;
import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;
import com.twelveweekyear.feature.auth.config.OtpProperties;
import com.twelveweekyear.feature.auth.domain.OtpPurpose;
import com.twelveweekyear.feature.auth.domain.OtpVerification;
import com.twelveweekyear.feature.auth.repository.OtpVerificationRepository;
import com.twelveweekyear.feature.auth.support.Otps;
import com.twelveweekyear.feature.user.domain.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;

/** Issues, resends and verifies one-time codes, enforcing cooldown, expiry and attempt limits. */
@Service
public class OtpService {

    private final OtpVerificationRepository repository;
    private final OtpProperties properties;
    private final EmailSender emailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(OtpVerificationRepository repository,
                      OtpProperties properties,
                      EmailSender emailSender) {
        this.repository = repository;
        this.properties = properties;
        this.emailSender = emailSender;
    }

    /**
     * Generates a fresh code, supersedes any previous one, persists its hash, and emails it.
     * Rejects with TOO_MANY_REQUESTS if the resend cooldown has not elapsed.
     */
    @Transactional
    public void sendCode(User user, OtpPurpose purpose) {
        Instant now = Instant.now();

        Optional<OtpVerification> latest =
                repository.findFirstByUserIdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(user.getId(), purpose);
        latest.ifPresent(otp -> {
            long wait = Otps.cooldownSecondsRemaining(otp.getCreatedAt(), properties.resendCooldown(), now);
            if (wait > 0) {
                throw new AppException(ErrorCode.TOO_MANY_REQUESTS,
                        "Please wait " + wait + " seconds before requesting a new code.");
            }
        });

        repository.consumeAllForUserAndPurpose(user.getId(), purpose);

        String code = Otps.generateCode(properties.length(), secureRandom);
        OtpVerification otp = new OtpVerification();
        otp.setUserId(user.getId());
        otp.setPurpose(purpose);
        otp.setCodeHash(Otps.hash(code));
        otp.setExpiresAt(now.plus(properties.expiry()));
        otp.setAttempts(0);
        otp.setConsumed(false);
        otp.setCreatedAt(now);
        repository.save(otp);

        emailSender.send(user.getEmail(), subjectFor(purpose), bodyFor(purpose, code));
    }

    /** Verifies a code; on success the code is consumed. Throws a validation error otherwise. */
    @Transactional
    public void verify(User user, OtpPurpose purpose, String code) {
        OtpVerification otp = repository
                .findFirstByUserIdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(user.getId(), purpose)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED,
                        "No active code. Please request a new one."));

        if (Otps.isExpired(otp.getExpiresAt(), Instant.now())) {
            otp.setConsumed(true);
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Code expired. Please request a new one.");
        }

        if (otp.getAttempts() >= properties.maxAttempts()) {
            otp.setConsumed(true);
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Too many attempts. Please request a new one.");
        }

        if (!otp.getCodeHash().equals(Otps.hash(code))) {
            otp.setAttempts(otp.getAttempts() + 1);
            int remaining = Math.max(0, properties.maxAttempts() - otp.getAttempts());
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Invalid code. " + remaining + " attempt(s) left.");
        }

        otp.setConsumed(true);
    }

    private String subjectFor(OtpPurpose purpose) {
        return purpose == OtpPurpose.PASSWORD_RESET
                ? "Reset your password"
                : "Verify your email";
    }

    private String bodyFor(OtpPurpose purpose, String code) {
        String action = purpose == OtpPurpose.PASSWORD_RESET ? "reset your password" : "verify your email";
        long minutes = properties.expiry().toMinutes();
        return """
                <p>Use this code to %s for <strong>The 12 Week Year</strong>:</p>
                <p style="font-size:24px;font-weight:700;letter-spacing:4px">%s</p>
                <p>It expires in %d minutes. If you didn't request this, you can ignore this email.</p>
                """.formatted(action, code, minutes);
    }
}
