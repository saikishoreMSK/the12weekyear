"use client";

import { useState } from "react";

import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { ApiException } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onAdded: (habit: Habit) => void;
}

/** Inline form to create a habit. */
export function AddHabitForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Give the habit a name.");
      return;
    }
    setSaving(true);
    try {
      const habit = await habitApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      setOpen(false);
      onAdded(habit);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Couldn't create the habit.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        New habit
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-card space-y-3 rounded-lg border p-4">
      <div className="space-y-1.5">
        <Label htmlFor="h-name">Name</Label>
        <Input id="h-name" placeholder="2 DSA questions" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="h-desc">Description (optional)</Label>
        <Input id="h-desc" placeholder="LeetCode medium+" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Creating…" : "Create"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setError(null); }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
