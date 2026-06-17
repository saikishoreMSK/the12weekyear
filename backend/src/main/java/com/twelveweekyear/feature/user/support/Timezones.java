package com.twelveweekyear.feature.user.support;

import com.twelveweekyear.common.exception.AppException;
import com.twelveweekyear.common.exception.ErrorCode;

import java.time.DateTimeException;
import java.time.ZoneId;

/** Validation/normalisation of IANA timezone ids — the day boundary for habits/streaks depends on this. */
public final class Timezones {

    public static final String DEFAULT = "UTC";

    private Timezones() {
    }

    /** Blank → {@link #DEFAULT}; otherwise must be a resolvable {@link ZoneId}, else a validation error. */
    public static String validate(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return DEFAULT;
        }
        try {
            return ZoneId.of(timezone.trim()).getId();
        } catch (DateTimeException ex) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Invalid timezone: " + timezone);
        }
    }
}
