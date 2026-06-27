package com.twelveweekyear.feature.quarter.dto;

import java.util.List;

/** The year overview: the four quarter tiles for {@code year}. */
public record YearDashboardResponse(
        int year,
        List<QuarterTile> quarters
) {
}
