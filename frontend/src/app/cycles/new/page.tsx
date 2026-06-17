"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cycleApi } from "@/features/cycle/api";
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

const schema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  objective: z.string().max(2000, "Objective is too long").optional(),
  startDate: z.string().min(1, "Start date is required"),
});
type FormValues = z.infer<typeof schema>;

/** Today as YYYY-MM-DD, for the date input's default. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewCyclePage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: todayIso() },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const cycle = await cycleApi.create({
        title: values.title,
        objective: values.objective || undefined,
        startDate: values.startDate,
      });
      router.replace(`/cycles/${cycle.id}`);
    } catch (error) {
      setFormError(
        error instanceof ApiException
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">New 12-week cycle</CardTitle>
            <CardDescription>
              Pick a start date and your single most important objective for the next 84 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Q3 2026 — Crack a product company"
                  aria-invalid={!!errors.title}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-destructive text-xs">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective (optional)</Label>
                <Textarea
                  id="objective"
                  rows={3}
                  placeholder="What does winning this cycle look like?"
                  {...register("objective")}
                />
                {errors.objective && (
                  <p className="text-destructive text-xs">{errors.objective.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  type="date"
                  aria-invalid={!!errors.startDate}
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-destructive text-xs">{errors.startDate.message}</p>
                )}
              </div>

              {formError && <p className="text-destructive text-sm">{formError}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create cycle"}
                </Button>
                <Button type="button" variant="ghost" asChild>
                  <Link href="/cycles">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
