import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Tracks when we last successfully synced with the server (manual sync or reconnect drain). */
const STORAGE_KEY = "twy.lastSynced";

let lastSynced: number | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export async function loadLastSynced(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    if (v) {
      lastSynced = Number(v) || null;
      notify();
    }
  } catch {
    // ignore
  }
}

export function markSynced(): void {
  lastSynced = Date.now();
  void AsyncStorage.setItem(STORAGE_KEY, String(lastSynced));
  notify();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot(): number | null {
  return lastSynced;
}

export function useLastSynced(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Human "x ago" from a timestamp. */
export function relativeTime(ts: number | null): string {
  if (!ts) return "not yet";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
