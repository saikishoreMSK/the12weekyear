package com.twelveweekyear.feature.analytics.dto;

import java.time.LocalDate;

/** One day in the contribution heatmap: how many habits were completed that day. */
public record HeatmapDay(LocalDate date, int count) {
}
