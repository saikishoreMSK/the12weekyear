"use client";

import { useState } from "react";

import { quarterApi } from "@/features/quarter/api";
import { weekRangeLabel } from "@/features/quarter/week-dates";
import { ApiException } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  quarterId: string;
  quarterStart: string;
  quarterEnd: string;
  totalWeeks: number;
  /** Weeks that already have a goal (excluded from the picker — one goal per week). */
  takenWeeks: number[];
  /** Pre-selected week (e.g. the current week on the /week page); still editable. */
  defaultWeek?: number;
  onAdded: () => void;
}

/** Add a weekly goal: just a title and which week it belongs to. */
export function AddGoalForm({
  quarterId,
  quarterStart,
  quarterEnd,
  totalWeeks,
  takenWeeks,
  defaultWeek,
  onAdded,
}: Props) {
  const available = Array.from({ length: totalWeeks }, (_, i) => i + 1).filter(
    (w) => !takenWeeks.includes(w),
  );
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [week, setWeek] = useState<number>(
    defaultWeek && available.includes(defaultWeek) ? defaultWeek : (available[0] ?? 1),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (available.length === 0) {
    return <p className="text-muted-foreground text-sm">Every week already has a goal.</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Give the goal a title.");
      return;
    }
    setSaving(true);
    try {
      await quarterApi.addGoal(quarterId, { title: title.trim(), week });
      setTitle("");
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
      <div className="space-y-1.5">
        <Label htmlFor="g-title">Goal</Label>
        <Input
          id="g-title"
          placeholder="e.g. Finish the system-design course"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="g-week">Week</Label>
        <select
          id="g-week"
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="border-input bg-background text-foreground h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {available.map((w) => (
            <option key={w} value={w} className="bg-background text-foreground">
              Week {w} ({weekRangeLabel(quarterStart, quarterEnd, w)})
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Adding…" : "Add goal"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
