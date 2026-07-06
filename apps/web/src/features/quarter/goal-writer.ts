import { quarterApi } from "@/features/quarter/api";

/**
 * Fire-and-forget writer for weekly-goal "done" toggles (same idea as the habit completion-writer).
 *
 *  - Debounces per goal: rapid tick/untick collapses into ONE request carrying the final state.
 *  - Last-write-wins (PATCH { done }), so a replay is safe.
 *  - Flushes anything pending when the page is hidden/closed. The server is the source of truth, so
 *    a rare lost flush self-heals on the next load.
 */
const DEBOUNCE_MS = 600;

interface Pending {
  quarterId: string;
  goalId: string;
  done: boolean;
}

const pending = new Map<string, Pending>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let errorHandler: (() => void) | null = null;

/** Register a callback invoked when a goal write fails (e.g. to re-sync from the server). */
export function onGoalError(handler: (() => void) | null): void {
  errorHandler = handler;
}

function send(p: Pending): void {
  quarterApi.updateGoal(p.quarterId, p.goalId, { done: p.done }).catch(() => errorHandler?.());
}

/** Queue the desired final done-state for a goal. */
export function writeGoal(quarterId: string, goalId: string, done: boolean): void {
  const key = goalId;
  pending.set(key, { quarterId, goalId, done });

  const existing = timers.get(key);
  if (existing) clearTimeout(existing);

  timers.set(
    key,
    setTimeout(() => {
      const p = pending.get(key);
      pending.delete(key);
      timers.delete(key);
      if (p) send(p);
    }, DEBOUNCE_MS),
  );
}

function flushAll(): void {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  const items = [...pending.values()];
  pending.clear();
  items.forEach(send);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAll();
  });
  window.addEventListener("pagehide", flushAll);
}
