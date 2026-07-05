"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { quarterApi } from "@/features/quarter/api";
import type { QuarterTile, YearDashboard } from "@/features/quarter/types";
import { AppHeader } from "@/components/app-header";
import { QuoteCard } from "@/components/quote-card";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [data, setData] = useState<YearDashboard | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setData(null);
    setError(false);
    quarterApi
      .dashboard(year)
      .then(setData)
      .catch(() => setError(true));
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <QuoteCard />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{year}</h1>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" aria-label="Previous year" onClick={() => setYear((y) => y - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Next year" onClick={() => setYear((y) => y + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {error && <p className="text-destructive mt-6 text-sm">Couldn&apos;t load your year.</p>}

        {!data && !error && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        )}

        {data && (
          <FadeIn className="mt-6 grid gap-4 sm:grid-cols-2">
            {data.quarters.map((q) => (
              <QuarterCard key={q.quarterNumber} year={year} tile={q} />
            ))}
          </FadeIn>
        )}
      </main>
    </div>
  );
}

function QuarterCard({ year, tile }: { year: number; tile: QuarterTile }) {
  const heading = `Q${tile.quarterNumber} · ${tile.label}`;

  if (!tile.planned) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex h-40 flex-col items-center justify-center gap-3 text-center">
          <div>
            <p className="font-semibold">{heading}</p>
            <p className="text-muted-foreground text-xs">Not planned yet</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/quarters/new?year=${year}&q=${tile.quarterNumber}`}>
              Plan Q{tile.quarterNumber}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/quarters/${tile.quarterId}`} className="block">
      <Card className="h-40 transition-colors hover:bg-accent/50">
        <CardContent className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold">{heading}</p>
              {tile.title && <p className="text-muted-foreground truncate text-xs">{tile.title}</p>}
            </div>
            <StateBadge state={tile.state} />
          </div>

          <div className="mt-auto">
            {tile.score !== null ? (
              <>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tabular-nums">{tile.score}%</span>
                  <span className="text-muted-foreground text-xs">
                    {tile.currentDay ? `Day ${tile.currentDay}/${tile.totalDays}` : `${tile.goalCount} goals`}
                  </span>
                </div>
                <Progress value={tile.score} className="mt-1.5" />
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                {tile.goalCount} {tile.goalCount === 1 ? "goal" : "goals"} planned · starts soon
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StateBadge({ state }: { state: QuarterTile["state"] }) {
  const styles: Record<QuarterTile["state"], string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    COMPLETED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    UPCOMING: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles[state]}`}>
      {state.toLowerCase()}
    </span>
  );
}
