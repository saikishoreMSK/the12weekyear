"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCurrentQuarter } from "@/features/quarter/queries";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";

function CurrentQuarterResolver() {
  const router = useRouter();
  const { data, isError: notPlanned } = useCurrentQuarter();

  useEffect(() => {
    if (data) router.replace(`/quarters/${data.id}`);
  }, [data, router]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-16 text-center">
        {notPlanned ? (
          <>
            <h1 className="text-lg font-semibold">No quarter planned yet</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Plan the current quarter from your dashboard to start tracking.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Loading…</p>
        )}
      </main>
    </div>
  );
}

export default function QuarterPage() {
  return (
    <RequireAuth>
      <CurrentQuarterResolver />
    </RequireAuth>
  );
}
