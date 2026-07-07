import AsyncStorage from "@react-native-async-storage/async-storage";

import type { User } from "@twy/core";

/** Persists the signed-in user so the app can open instantly (authenticated) without waiting on /users/me. */
const STORAGE_KEY = "twy.user";

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export async function loadUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
