"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HABITS_KEY } from "@/features/habit/queries";
import { flushCompletions, onCompletionError } from "@/features/habit/completion-writer";
import { flushGoals, onGoalError } from "@/features/quarter/goal-writer";

/**
 * App-wide client cache for GET requests. Data is reused across navigations (no refetch within
 * staleTime), so jumping between Dashboard / Week / Habits doesn't re-download the same thing.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // reuse cached data for 30s before revalidating
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // If a background write fails, re-fetch so the UI reconciles with the server.
  useEffect(() => {
    onCompletionError(() => client.invalidateQueries({ queryKey: HABITS_KEY }));
    onGoalError(() => client.invalidateQueries({ queryKey: ["quarter"] }));
    return () => {
      onCompletionError(null);
      onGoalError(null);
    };
  }, [client]);

  // Flush any pending debounced writes before the tab is hidden/closed (web lifecycle).
  useEffect(() => {
    const flush = () => {
      flushCompletions();
      flushGoals();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
