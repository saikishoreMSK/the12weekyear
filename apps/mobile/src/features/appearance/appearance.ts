import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePref = "system" | "light" | "dark";

const STORAGE_KEY = "twy.theme";

export async function loadThemePref(): Promise<ThemePref> {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // ignore
  }
  return "system";
}

export async function saveThemePref(pref: ThemePref): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, pref);
}
