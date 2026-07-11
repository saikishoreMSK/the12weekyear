import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/auth-context";

/**
 * Phase 3 — cloud sync polish for the (cloud-direct) signed-in app:
 *
 *  1. Account isolation: when the account changes (guest → sign-in, sign-out, or switching users)
 *     the cached read data is dropped, so you never briefly see the previous account's / a guest's
 *     data before the refetch.
 *
 *  2. Pull-down: whenever the app returns to the foreground while signed in, invalidate the queries
 *     so edits made on another device or the web show up. Throttled so rapid active/inactive flips
 *     don't spam the (free-tier) backend; while offline this just marks data stale and TanStack
 *     refetches on reconnect. Guests have no cloud, so this is a no-op for them.
 */
export function useCloudSync(): void {
  const { user, status } = useAuth();
  const qc = useQueryClient();
  const prevId = useRef<string | null | undefined>(undefined);
  const lastPull = useRef(0);

  // Drop cached data on account change.
  useEffect(() => {
    if (status === "loading") return;
    const id = user?.id ?? null; // null = guest
    if (prevId.current !== undefined && prevId.current !== id) {
      qc.clear();
    }
    prevId.current = id;
  }, [user?.id, status, qc]);

  // Pull the latest down when the app foregrounds while signed in.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active" || status !== "authenticated") return;
      const now = Date.now();
      if (now - lastPull.current < 60_000) return;
      lastPull.current = now;
      void qc.invalidateQueries();
    });
    return () => sub.remove();
  }, [status, qc]);
}
