"use client";

import { useState } from "react";

import { quarterApi } from "@/features/quarter/api";
import { ApiException } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  quarterId: string;
  totalWeeks: number;
  onAdded: () => void;
}

/** Inline form to add a goal to a quarter. Week range defaults to the whole quarter. */
export function AddGoalForm({ quarterId, totalWeeks, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [weekStart, setWeekStart] = useState("1");
  const [weekEnd, setWeekEnd] = useState(String(totalWeeks));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setCategory("");
    setTitle("");
    setUnit("");
    setTargetValue("");
    setWeekStart("1");
    setWeekEnd(String(totalWeeks));
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const target = Number(targetValue);
    if (!category.trim() || !title.trim() || !unit.trim() || !Number.isFinite(target) || target < 1) {
      setError("Fill in category, title, unit, and a target of at least 1.");
      return;
    }
    setSaving(true);
    try {
      await quarterApi.addGoal(quarterId, {
        category: category.trim(),
        title: title.trim(),
        unit: unit.trim(),
        targetValue: target,
        weekStart: Number(weekStart),
        weekEnd: Number(weekEnd),
      });
      reset();
      setOpen(false);
      onAdded();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Couldn't add the goal.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add goal
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-card space-y-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="g-category">Category</Label>
          <Input id="g-category" placeholder="DSA" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-unit">Unit</Label>
          <Input id="g-unit" placeholder="problems" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="g-title">Title</Label>
        <Input id="g-title" placeholder="Solve 28 DSA problems" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="g-target">Target</Label>
          <Input id="g-target" type="number" min={1} placeholder="28" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-week-start">Week start</Label>
          <Input id="g-week-start" type="number" min={1} max={totalWeeks} value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-week-end">Week end</Label>
          <Input id="g-week-end" type="number" min={1} max={totalWeeks} value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Adding…" : "Add goal"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
