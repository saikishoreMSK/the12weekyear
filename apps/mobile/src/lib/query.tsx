import { useEffect, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HABITS_KEY, flushCompletions, flushGoals, onCompletionError, onGoalError } from "@twy/core";

/**
 * App-wide read cache for GET requests (mirrors the web app): data is reused across tab switches
 * without refetching within staleTime. Also wires optimistic-write error recovery + flush-on-background.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
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

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
