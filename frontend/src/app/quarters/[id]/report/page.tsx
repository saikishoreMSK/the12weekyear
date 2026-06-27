"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, X } from "lucide-react";

import { quarterApi } from "@/features/quarter/api";
import type { QuarterReport } from "@/features/quarter/types";
import { AppHeader } from "@/components/app-header";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuarterReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<QuarterReport | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    quarterApi
      .report(id)
      .then((r) => active && setReport(r))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        {error && <p className="text-destructive text-sm">Couldn&apos;t load the report.</p>}
        {!report && !error && (
          <>
            <Skeleton className="h-7 w-56" />
            <Skeleton className="mt-4 h-24 w-full" />
          </>
        )}

        {report && (
          <FadeIn className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Q{report.quarterNumber} · {report.label} {report.year} — Report
                </h1>
                {report.title && <p className="text-muted-foreground text-sm">{report.title}</p>}
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/quarters/${report.id}`}>Back</Link>
              </Button>
            </div>

            <Card>
              <CardContent className="py-6">
                <p className="text-muted-foreground text-sm font-medium">Final score</p>
                <p className="text-4xl font-bold tabular-nums">{report.sprintScore}%</p>
                <Progress value={report.sprintScore} className="mt-3" />
                <p className="text-muted-foreground mt-3 text-xs">
                  Goals {report.goalsProgress}% · Habits {report.habitsConsistency}% ·{" "}
                  {report.reviewsCompleted}/{report.totalWeeks} weekly reviews
                </p>
              </CardContent>
            </Card>

            <section>
              <h2 className="mb-2 text-lg font-semibold">Goals</h2>
              {report.goals.length === 0 ? (
                <p className="text-muted-foreground text-sm">No goals were set.</p>
              ) : (
                <div className="space-y-2">
                  {report.goals.map((g, i) => (
                    <div key={i} className="bg-card flex items-center gap-3 rounded-lg border p-3">
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                          g.met
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {g.met ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        <span className="text-muted-foreground">{g.category}: </span>
                        {g.title}
                      </span>
                      <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                        {g.currentValue}/{g.targetValue} {g.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold">Habits this quarter</h2>
              {report.habits.length === 0 ? (
                <p className="text-muted-foreground text-sm">No habits tracked.</p>
              ) : (
                <div className="space-y-2">
                  {report.habits.map((h, i) => (
                    <div key={i} className="bg-card flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                      <span className="min-w-0 flex-1 truncate font-medium">{h.name}</span>
                      <span className="text-muted-foreground shrink-0 tabular-nums">
                        {h.completionRate}% · 🔥 {h.longestStreak} best
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
