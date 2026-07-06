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
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WidgetSnapshot) : null;
  } catch {
    return null;
  }
}
