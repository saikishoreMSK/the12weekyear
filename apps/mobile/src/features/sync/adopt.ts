import { useSyncExternalStore } from "react";
import type { QueryClient } from "@tanstack/react-query";

import { replayImport } from "@twy/core";
import { clearLocalData, exportLocalData, hasLocalData } from "@/lib/local-backend";

/**
 * Phase 2 — guest-data adoption. When a guest signs in, upload their on-device data to the cloud
 * (one-way) via the idempotent replayImport, then wipe the local copy and refresh from the server.
 * State is exposed reactively so Profile can show progress / offer a retry.
 */
type AdoptState = "idle" | "importing" | "error" | "done";

let state: AdoptState = "idle";
let running = false;
const listeners = new Set<() => void>();

function set(next: AdoptState): void {
  state = next;
  listeners.forEach((l) => l());
}

/** Attempt adoption once. No-ops if already running, already done this session, or no local data. */
export async function adoptLocalData(qc: QueryClient): Promise<void> {
  if (running || state === "done") return;
  if (!(await hasLocalData())) {
    set("done");
    return;
  }
  running = true;
  set("importing");
  try {
    await replayImport(await exportLocalData());
    await clearLocalData();
    set("done");
    void qc.invalidateQueries();
  } catch {
    set("error");
  } finally {
    running = false;
  }
}

export function retryAdoption(qc: QueryClient): void {
  if (state === "error") {
    state = "idle";
    void adoptLocalData(qc);
  }
}

/** Called when returning to guest mode (logout) so a later sign-in can adopt again. */
export function resetAdoption(): void {
  running = false;
  state = "idle";
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAdoptState(): AdoptState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
