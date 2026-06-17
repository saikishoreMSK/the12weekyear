"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { cycleApi } from "@/features/cycle/api";
import type { CycleSummary } from "@/features/cycle/types";
import { AppHeader } from "@/components/app-header";
import { Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CyclesPage() {
  const [cycles, setCycles] = useState<CycleSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    cycleApi
      .list()
      .then((data) => active && setCycles(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Your cycles</h1>
          <Button asChild size="sm">
            <Link href="/cycles/new">New cycle</Link>
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {error && (
            <p className="text-destructive text-sm">Couldn&apos;t load your cycles.</p>
          )}

          {cycles === null && !error && (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          )}

          {cycles?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No cycles yet. Start your first 12-week cycle.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/cycles/new">Create a cycle</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {cycles && cycles.length > 0 && (
            <Stagger className="space-y-3">
              {cycles.map((cycle) => (
                <StaggerItem key={cycle.id}>
                  <Link href={`/cycles/${cycle.id}`} className="block">
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="text-base">{cycle.title}</CardTitle>
                          <StatusBadge status={cycle.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="text-muted-foreground flex justify-between text-sm">
                        <span>
                          {cycle.currentDay
                            ? `Day ${cycle.currentDay} / ${cycle.totalDays}`
                            : `${cycle.startDate} → ${cycle.endDate}`}
                        </span>
                        <span>
                          {cycle.goalCount} {cycle.goalCount === 1 ? "goal" : "goals"}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: CycleSummary["status"] }) {
  const styles: Record<CycleSummary["status"], string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    COMPLETED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    ARCHIVED: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status.toLowerCase()}
    </span>
  );
}
