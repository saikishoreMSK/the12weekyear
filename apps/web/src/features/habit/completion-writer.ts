import { habitApi } from "./api";

/**
 * Fire-and-forget writer for habit completions.
 *
 *  - Debounces per (habit, date): rapid tick/untick/tick collapses into ONE request carrying the
 *    final state, so we don't spam the server.
 *  - Idempotent (set-state via PUT/DELETE), so a retry or a replay is always safe.
 *  - Flushes anything pending when the page is hidden/closed, so a change made just before leaving
 *    still reaches the server. Because the server is the source of truth and completions are
 *    idempotent booleans, a rare lost flush self-heals on the next load.
 */
const DEBOUNCE_MS = 700;

interface Pending {
  habitId: string;
  date: string;
  done: boolean;
}

const pending = new Map<string, Pending>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let errorHandler: (() => void) | null = null;

/** Register a callback invoked when a completion write fails (e.g. to re-sync from the server). */
export function onCompletionError(handler: (() => void) | null): void {
  errorHandler = handler;
}

function send(p: Pending): void {
  const request = p.done
    ? habitApi.markDate(p.habitId, p.date)
    : habitApi.unmarkDate(p.habitId, p.date);
  request.catch(() => errorHandler?.());
}

/** Queue the desired final state for a (habit, date). */
export function writeCompletion(habitId: string, date: string, done: boolean): void {
  const key = `${habitId}|${date}`;
  pending.set(key, { habitId, date, done });

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
