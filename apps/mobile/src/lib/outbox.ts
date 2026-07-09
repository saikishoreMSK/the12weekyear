import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { onWriteQueued, opKey, sendOp, type WriteOp } from "@twy/core";

/**
 * Persisted offline write outbox. When a debounced write fails because the device is offline, core
 * hands us the op; we store it (coalesced by target) in AsyncStorage and replay it on reconnect.
 * Because completions are idempotent and goals are last-write-wins, replaying the final state is safe.
 */
const STORAGE_KEY = "twy.outbox";

let ops = new Map<string, WriteOp>();
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function persist() {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ops.values()]));
}

/** Restore any ops queued in a previous session. */
export async function loadOutbox(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as WriteOp[];
      ops = new Map(arr.map((o) => [opKey(o), o]));
      notify();
    }
  } catch {
    // ignore corrupt cache
  }
}

/** Add/replace an op (called by core when a write fails offline). */
function enqueue(op: WriteOp): void {
  ops.set(opKey(op), op);
  persist();
  notify();
}

/** Try to send everything queued. Returns true if at least one op succeeded. */
export async function drainOutbox(): Promise<boolean> {
  if (ops.size === 0) return false;
  let changed = false;
  for (const [key, op] of [...ops.entries()]) {
    try {
      await sendOp(op);
      ops.delete(key);
      changed = true;
    } catch {
      // still failing (offline again / server error) — keep it for the next drain
    }
  }
  if (changed) {
    persist();
    notify();
  }
  return changed;
}

export function pendingCount(): number {
  return ops.size;
}

/** True while an offline display-name edit is queued — used to avoid a background getMe clobbering it. */
export function hasPendingProfile(): boolean {
  return [...ops.values()].some((o) => o.kind === "profile");
}

export function subscribeOutbox(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive pending-write count for the sync-status UI. */
export function usePendingCount(): number {
  return useSyncExternalStore(subscribeOutbox, pendingCount, pendingCount);
}

// Register as the core write queue as soon as this module is imported.
onWriteQueued(enqueue);
