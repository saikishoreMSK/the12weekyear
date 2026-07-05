"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { quarterApi } from "@/features/quarter/api";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";

function CurrentQuarterResolver() {
  const router = useRouter();
  const [notPlanned, setNotPlanned] = useState(false);

  useEffect(() => {
    let active = true;
    quarterApi
      .current()
      .then((q) => {
        if (active) router.replace(`/quarters/${q.id}`);
      })
      .catch(() => {
        if (active) setNotPlanned(true);
      });
    return () => {
      active = false;
    };
  }, [router]);

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
