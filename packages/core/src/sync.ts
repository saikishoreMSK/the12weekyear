import { ApiException } from "./api/client";
import { authApi } from "./auth/api";
import { habitApi } from "./habit/api";
import { quarterApi } from "./quarter/api";

/**
 * Offline write queue seam. The debounced writers, when a write fails purely because the device is
 * offline, hand the final desired op to a registered queue handler instead of erroring. The mobile
 * app registers an AsyncStorage-backed outbox and replays ops on reconnect; the web app registers
 * nothing, so it falls back to its normal "invalidate on error" behavior.
 */
export type WriteOp =
  | { kind: "completion"; habitId: string; date: string; done: boolean }
  | { kind: "goal"; quarterId: string; goalId: string; done: boolean }
  | { kind: "profile"; displayName: string };

/** Stable key so re-queuing the same target coalesces to the latest desired state. */
export function opKey(op: WriteOp): string {
  if (op.kind === "completion") return `c:${op.habitId}:${op.date}`;
  if (op.kind === "goal") return `g:${op.goalId}`;
  return "p:profile";
}

let queueHandler: ((op: WriteOp) => void) | null = null;

/** Register the platform outbox (mobile). Pass null to unregister. */
export function onWriteQueued(handler: ((op: WriteOp) => void) | null): void {
  queueHandler = handler;
}

/** Queue an op if a handler is registered; returns whether it was queued. */
export function queueWrite(op: WriteOp): boolean {
  if (queueHandler) {
    queueHandler(op);
    return true;
  }
  return false;
}

/** True when a failure was purely a transport/offline error (see ApiException in the client). */
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiException && error.code === "NETWORK_ERROR";
}

/** Replay a queued op against the API (used by the outbox on reconnect). */
export function sendOp(op: WriteOp): Promise<unknown> {
  if (op.kind === "completion") {
    return op.done ? habitApi.markDate(op.habitId, op.date) : habitApi.unmarkDate(op.habitId, op.date);
  }
  if (op.kind === "goal") {
    return quarterApi.updateGoal(op.quarterId, op.goalId, { done: op.done });
  }
  return authApi.updateMe({ displayName: op.displayName });
}
