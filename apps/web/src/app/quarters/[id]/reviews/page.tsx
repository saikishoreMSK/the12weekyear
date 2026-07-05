"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { quarterApi } from "@/features/quarter/api";
import type { Quarter } from "@/features/quarter/types";
import { reviewApi } from "@/features/review/api";
import type { WeeklyReview, WeeklyReviewInput } from "@/features/review/types";
import { ApiException } from "@/lib/api/client";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PROMPTS: { key: keyof WeeklyReviewInput; label: string; placeholder: string }[] = [
  { key: "wentWell", label: "What went well?", placeholder: "Wins, momentum, things to keep doing…" },
  { key: "wastedTime", label: "What wasted time?", placeholder: "Distractions, low-value work…" },
  { key: "biggestWin", label: "Biggest win?", placeholder: "The one thing you're proudest of…" },
  { key: "biggestBlocker", label: "Biggest blocker?", placeholder: "What got in the way…" },
];

type Form = Record<keyof WeeklyReviewInput, string>;
const EMPTY_FORM: Form = { wentWell: "", wastedTime: "", biggestWin: "", biggestBlocker: "" };

function toForm(review?: WeeklyReview): Form {
  return {
    wentWell: review?.wentWell ?? "",
    wastedTime: review?.wastedTime ?? "",
    biggestWin: review?.biggestWin ?? "",
    biggestBlocker: review?.biggestBlocker ?? "",
  };
}

export default function QuarterReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const [reviews, setReviews] = useState<Record<number, WeeklyReview>>({});
  const [week, setWeek] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const [q, list] = await Promise.all([quarterApi.get(id), reviewApi.list(id)]);
      const map: Record<number, WeeklyReview> = {};
      list.forEach((r) => (map[r.weekNumber] = r));
      const initialWeek = q.currentWeek ?? 1;
      setQuarter(q);
      setReviews(map);
      setWeek(initialWeek);
      setForm(toForm(map[initialWeek]));
    } catch {
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function selectWeek(w: number) {
    setWeek(w);
    setForm(toForm(reviews[w]));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const review = await reviewApi.save(id, week, form);
      setReviews((prev) => ({ ...prev, [week]: review }));
      setSaved(true);
    } catch (err) {
      setError(!(err instanceof ApiException));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        {error && <p className="text-destructive text-sm">Couldn&apos;t load reviews.</p>}
        {!quarter && !error && <p className="text-muted-foreground text-sm">Loading…</p>}

        {quarter && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Weekly review</h1>
                <p className="text-muted-foreground text-sm">
                  Q{quarter.quarterNumber} · {quarter.label} {quarter.year}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/quarters/${quarter.id}`}>Back to quarter</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from({ length: quarter.totalWeeks }, (_, i) => i + 1).map((w) => {
                const reviewed = Boolean(reviews[w]);
                const isCurrent = quarter.currentWeek === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => selectWeek(w)}
                    className={[
                      "relative flex size-9 items-center justify-center rounded-md border text-sm tabular-nums transition-colors",
                      w === week
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-accent",
                      isCurrent && w !== week ? "ring-primary/40 ring-2" : "",
                    ].join(" ")}
                    aria-label={`Week ${w}${reviewed ? ", reviewed" : ""}`}
                  >
                    {w}
                    {reviewed && (
                      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-4">
              {PROMPTS.map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key}>{label}</Label>
                  <Textarea
                    id={key}
                    rows={3}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, [key]: e.target.value }));
                      setSaved(false);
                    }}
                  />
                </div>
              ))}

              <div className="flex items-center gap-3">
                <Button onClick={save} disabled={saving}>
                  {saving ? "Saving…" : `Save week ${week}`}
                </Button>
                {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span>}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
