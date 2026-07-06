import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Local notification preferences (persisted). Times are fixed preset slots (toggleable) to keep the
 * UI simple and avoid a native time-picker; free time-editing can be added later.
 */
export interface NotificationPrefs {
  enabled: boolean; // master switch
  morning: boolean; // 08:00 daily
  midday: boolean; // 13:00 daily
  evening: boolean; // 20:00 daily
  weeklyReview: boolean; // Sunday 18:00
  quarterEnd: boolean; // ~2 days before the quarter ends, 10:00
}

export const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  morning: true,
  midday: false,
  evening: true,
  weeklyReview: true,
  quarterEnd: true,
};

const STORAGE_KEY = "twy.notificationPrefs";

export async function loadPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch {
    // ignore corrupt data
  }
  return DEFAULT_PREFS;
}

export async function savePrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
