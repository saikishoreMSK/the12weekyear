"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HABITS_KEY } from "@/features/habit/queries";
import { onCompletionError } from "@/features/habit/completion-writer";

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

  // If a background habit-completion write fails, re-fetch habits so the UI reconciles with the server.
  useEffect(() => {
    onCompletionError(() => client.invalidateQueries({ queryKey: HABITS_KEY }));
    return () => onCompletionError(null);
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
