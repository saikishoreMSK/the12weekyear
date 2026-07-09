import AsyncStorage from "@react-native-async-storage/async-storage";

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
