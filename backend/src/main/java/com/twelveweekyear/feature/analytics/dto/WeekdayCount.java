package com.twelveweekyear.feature.analytics.dto;

/** Total completions on a given weekday over the window. {@code dayOfWeek} is e.g. "MONDAY". */
public record WeekdayCount(String dayOfWeek, long count) {
}
