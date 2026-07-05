"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { quarterApi } from "@/features/quarter/api";
import { ApiException } from "@/lib/api/client";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QUARTER_LABELS = ["Q1 · Jan – Mar", "Q2 · Apr – Jun", "Q3 · Jul – Sep", "Q4 · Oct – Dec"];

function NewQuarterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const year = Number(params.get("year")) || new Date().getFullYear();
  const quarterNumber = Math.min(4, Math.max(1, Number(params.get("q")) || 1));

  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const quarter = await quarterApi.create({
        year,
        quarterNumber,
        title: title.trim() || undefined,
        objective: objective.trim() || undefined,
      });
      router.replace(`/quarters/${quarter.id}`);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Couldn't create the quarter.");
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Plan {QUARTER_LABELS[quarterNumber - 1]} {year}</CardTitle>
        <CardDescription>
          Set your single most important objective for this quarter. You can add goals next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Crack a product company"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Objective (optional)</Label>
            <Textarea
              id="objective"
              rows={3}
              placeholder="What does winning this quarter look like?"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create quarter"}
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function NewQuarterPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8">
        <Suspense fallback={null}>
          <NewQuarterForm />
        </Suspense>
      </main>
    </div>
  );
}
