"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { habitApi } from "@/features/habit/api";
import type { Habit } from "@/features/habit/types";
import { HabitDayGrid } from "@/features/habit/components/habit-day-grid";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const load = useCallback(() => {
    habitApi
      .get(id)
      .then((h) => {
        setHabit(h);
        setName(h.name);
      })
      .catch(() => setError(true));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveName() {
    if (!habit || !name.trim()) return;
    const updated = await habitApi.update(habit.id, { name: name.trim() });
    setHabit(updated);
    setEditing(false);
  }

  async function toggleArchive() {
    if (!habit) return;
    setHabit(await habitApi.update(habit.id, { active: !habit.active }));
  }

  async function remove() {
    if (!habit) return;
    if (!window.confirm("Delete this habit and its history? This can't be undone.")) return;
    await habitApi.remove(habit.id);
    router.replace("/habits");
  }

  if (error) return <Shell><p className="text-destructive text-sm">Habit not found.</p></Shell>;
  if (!habit) return <Shell><p className="text-muted-foreground text-sm">Loading…</p></Shell>;

  return (
    <Shell>
      <div className="flex items-start justify-between gap-3">
        {editing ? (
          <div className="flex flex-1 gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Button size="sm" onClick={saveName}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(habit.name); }}>
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{habit.name}</h1>
            {habit.description && (
              <p className="text-muted-foreground text-sm">{habit.description}</p>
            )}
          </div>
        )}
        {!editing && (
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Rename
            </Button>
            <Button size="sm" variant="outline" onClick={toggleArchive}>
              {habit.active ? "Archive" : "Resume"}
            </Button>
          </div>
        )}
      </div>

      {!habit.active && (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 text-muted-foreground text-xs">
          This habit is archived — it&apos;s hidden from your daily tracker until you resume it.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Current streak" value={`${habit.currentStreak}`} suffix="days" />
        <Stat label="Longest streak" value={`${habit.longestStreak}`} suffix="days" />
        <Stat label="Completion" value={`${habit.completionRate}%`} />
        <Stat label="Total done" value={`${habit.totalCompletions}`} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Last 14 days</h2>
        <p className="text-muted-foreground mb-3 text-xs">Tap a day to mark it done or undo it.</p>
        <HabitDayGrid habit={habit} onChanged={setHabit} />
      </section>

      <div className="mt-10 border-t pt-4">
        <Button variant="ghost" size="sm" className="text-destructive" onClick={remove}>
          Delete habit
        </Button>
      </div>
    </Shell>
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
