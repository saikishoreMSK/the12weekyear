package com.twelveweekyear.feature.habit.support;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

/**
 * Streak math over a set of "active" dates. Shared by per-habit stats ({@link HabitStats}) and the
 * overall activity analytics, since both ask the same question of a set of dates.
 */
public final class Streaks {

    private Streaks() {
    }

    /**
     * Consecutive active days ending at today (if active) or yesterday — so the streak stays alive
     * through today until midnight. Zero if neither today nor yesterday is active.
     */
    public static int current(LocalDate today, Set<LocalDate> activeDays) {
        int streak = 0;
        LocalDate cursor = activeDays.contains(today) ? today : today.minusDays(1);
        while (activeDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    /** Longest run of consecutive active days ever. */
    public static int longest(Set<LocalDate> activeDays) {
        if (activeDays.isEmpty()) {
            return 0;
        }
        List<LocalDate> sorted = new ArrayList<>(activeDays);
        Collections.sort(sorted);

        int longest = 1;
        int run = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).equals(sorted.get(i - 1).plusDays(1))) {
                run++;
            } else {
                run = 1;
            }
            longest = Math.max(longest, run);
        }
        return longest;
    }
}
