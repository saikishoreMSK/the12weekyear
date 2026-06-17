package com.twelveweekyear.feature.cycle.domain;

/** Lifecycle of a 12-week cycle. */
public enum CycleStatus {
    /** Currently being executed. */
    ACTIVE,
    /** Finished its 12 weeks (or marked done early). */
    COMPLETED,
    /** Set aside; kept for history but not surfaced as current. */
    ARCHIVED
}
