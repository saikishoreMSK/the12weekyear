import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

import { HABITS_KEY, flushCompletions, flushGoals, onCompletionError, onGoalError } from "@twy/core";
import { drainOutbox, loadOutbox } from "@/lib/outbox";

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

// Persist the read cache to device storage so the app opens with last-synced data when offline.
const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: "twy.queryCache" });

// Drive TanStack Query's online state from real connectivity (so it pauses fetches when offline).
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected)),
);

/** Reactive online/offline flag for the sync-status UI. */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (cb) => onlineManager.subscribe(cb),
    () => onlineManager.isOnline(),
    () => true,
  );
}

/**
 * App-wide read cache for GET requests, persisted to AsyncStorage (offline-first): on cold start
 * the last-synced quarters/habits/analytics are shown immediately, and optimistic edits survive
 * restarts. Wires optimistic-write error recovery, flush-on-background, and the offline outbox.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: ONE_WEEK, // keep long enough to be persisted/restored
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // If a background write fails (non-offline), re-fetch so the UI reconciles with the server.
  useEffect(() => {
    onCompletionError(() => client.invalidateQueries({ queryKey: HABITS_KEY }));
    onGoalError(() => client.invalidateQueries({ queryKey: ["quarter"] }));
    return () => {
      onCompletionError(null);
      onGoalError(null);
    };
  }, [client]);

  // Flush pending debounced writes when the app goes to the background (mobile lifecycle).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        flushCompletions();
        flushGoals();
      }
    });
    return () => sub.remove();
  }, []);

  // Offline outbox: restore queued writes, and replay them whenever connectivity returns.
  useEffect(() => {
    const replay = () =>
      drainOutbox().then((changed) => {
        if (changed) client.invalidateQueries();
      });
    loadOutbox().then(() => {
      if (onlineManager.isOnline()) replay();
    });
    const unsub = onlineManager.subscribe((online) => {
      if (online) replay();
    });
    return unsub;
  }, [client]);

  return (
    <PersistQueryClientProvider client={client} persistOptions={{ persister, maxAge: ONE_WEEK }}>
      {children}
    </PersistQueryClientProvider>
  );
}
