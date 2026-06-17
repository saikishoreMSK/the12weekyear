"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-context";

/**
 * Client-side route guard: renders children only for an authenticated user, otherwise redirects
 * to /login. While the session is being restored it shows a neutral loading state.
 *
 * (This is UX-level protection. The real authorization boundary is the API, which rejects any
 * request without a valid access token.)
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
