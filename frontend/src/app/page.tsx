import Link from "next/link";

import { ApiStatus } from "@/features/health/components/api-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-semibold tracking-tight">12WY</span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 text-center">
        <ApiStatus />

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The 12 Week Year
          </h1>
          <p className="mx-auto max-w-md text-balance text-muted-foreground">
            Stop planning in years. Execute your goals in focused 12-week cycles
            — daily habits, weekly reviews, and a sprint dashboard that keeps you
            honest.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </main>

      <footer className="px-5 py-4 text-center text-xs text-muted-foreground">
        Phase 1 — Authentication
      </footer>
    </div>
  );
}
