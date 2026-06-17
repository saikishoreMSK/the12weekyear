"use client";

import { useEffect, useState } from "react";

import { analyticsApi } from "@/features/analytics/api";
import type { Analytics } from "@/features/analytics/types";
import { ContributionHeatmap } from "@/features/analytics/components/contribution-heatmap";
import { WeekdayBars } from "@/features/analytics/components/weekday-bars";
import { AppHeader } from "@/components/app-header";
import { FadeIn } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDay(day: string | null): string {
  if (!day) return "—";
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    analyticsApi
      .get()
      .then((d) => active && setData(d))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>

        {error && <p className="text-destructive mt-4 text-sm">Couldn&apos;t load analytics.</p>}

        {!data && !error && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {data && (
          <FadeIn className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Current streak" value={`${data.currentStreak}`} suffix="days" />
              <Stat label="Longest streak" value={`${data.longestStreak}`} suffix="days" />
              <Stat label="Best day" value={formatDay(data.bestDayOfWeek)} />
              <Stat label="Worst day" value={formatDay(data.worstDayOfWeek)} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ContributionHeatmap
                  windowStart={data.windowStart}
                  windowEnd={data.windowEnd}
                  heatmap={data.heatmap}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">By day of week</CardTitle>
              </CardHeader>
              <CardContent>
                <WeekdayBars data={data.weekdayCounts} />
              </CardContent>
            </Card>

            <p className="text-muted-foreground text-xs">
              {data.totalCompletions} completions across {data.activeDays} active days.
            </p>
          </FadeIn>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="bg-card rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">
        {value}
        {suffix && <span className="text-muted-foreground ml-1 text-xs font-normal">{suffix}</span>}
      </p>
    </div>
  );
}
