package com.twelveweekyear.feature.quarter.dto;

import jakarta.validation.constraints.Size;

/** Partial update of a quarter's editable fields (timing is fixed by the calendar). */
public record UpdateQuarterRequest(
        @Size(max = 120) String title,
        @Size(max = 2000) String objective
) {
}
