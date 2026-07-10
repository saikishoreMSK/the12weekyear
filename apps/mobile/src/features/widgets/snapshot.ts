import AsyncStorage from "@react-native-async-storage/async-storage";

import { toIsoDate, weekDates, type Habit, type Quarter } from "@twy/core";

/**
 * A small snapshot of the data the home-screen widgets need, written by the app whenever data
 * changes and read by the widget task handler (which runs headless, even when the app is closed).
 */
export interface WidgetSnapshot {
  quarter: {
    label: string;
    year: number;
    score: number;
    currentDay: number | null;
    totalDays: number;
  } | null;
  week: {
    number: number;
    goalTitle: string | null;
    goalDone: boolean;
    days: boolean[]; // per-day habit activity for the current week
  } | null;
  habits: { name: string; done: boolean }[]; // today's active habits
}

const STORAGE_KEY = "twy.widgetSnapshot";

/** Build the widget snapshot from the current quarter + habits (pure; no native/storage deps). */
export function buildWidgetSnapshot(
  quarter: Quarter | undefined,
  habits: Habit[] | undefined,
): WidgetSnapshot {
  const activeHabits = (habits ?? []).filter((h) => h.active);
  const today = toIsoDate(new Date());
  const habitsSnap = activeHabits.map((h) => ({
    name: h.name,
    done: (h.completionDates ?? []).includes(today),
  }));

  let quarter_: WidgetSnapshot["quarter"] = null;
  let week: WidgetSnapshot["week"] = null;
  if (quarter) {
    quarter_ = {
      label: `Q${quarter.quarterNumber} · ${quarter.label}`,
      year: quarter.year,
      score: quarter.sprintScore,
      currentDay: quarter.currentDay,
      totalDays: quarter.totalDays,
    };
    const wk = quarter.currentWeek ?? 1;
    const goal = quarter.goals.find((g) => g.week === wk) ?? null;
    const days = weekDates(quarter.startDate, quarter.endDate, wk).map((d) =>
      activeHabits.some((h) => (h.completionDates ?? []).includes(toIsoDate(d))),
    );
    week = { number: wk, goalTitle: goal?.title ?? null, goalDone: goal?.done ?? false, days };
  }
  return { quarter: quarter_, week, habits: habitsSnap };
}

export async function saveWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export async function loadWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  // Let a storage read failure propagate (the widget task handler surfaces it) so a headless
  // AsyncStorage problem isn't silently mistaken for "no data". Only a corrupt value is swallowed.
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WidgetSnapshot;
  } catch {
    return null;
  }
}
