import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { habitApi, parseIsoDate, toIsoDate, useHabitActions, useHabits, type Habit } from "@twy/core";
import { Screen } from "@/components/screen";
import { tapHaptic } from "@/lib/haptics";
import { useColors } from "@/theme";

const TODAY = toIsoDate(new Date());
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(base: Date): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return d;
}

function dayLabel(iso: string): string {
  if (iso === TODAY) return "Today";
  return parseIsoDate(iso).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function HabitsScreen() {
  const { data: habits, isError } = useHabits();
  const actions = useHabitActions();
  const router = useRouter();
  const c = useColors();
  const [selected, setSelected] = useState(TODAY);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, …

  const active = habits?.filter((h) => h.active) ?? [];
  const archived = habits?.filter((h) => !h.active) ?? [];

  // Fraction (0–1) of active habits completed on a given day — drives the day box's green fill.
  const dayFraction = (iso: string) =>
    active.length ? active.filter((h) => h.completionDates.includes(iso)).length / active.length : 0;

  // "Perfect-day" streak: consecutive days where ALL active habits were completed. Anything under
  // 100% breaks it. Today not-yet-complete doesn't break it (we start counting from yesterday).
  const perfectStreak = useMemo(() => {
    if (active.length === 0) return 0;
    const isPerfect = (iso: string) => active.every((h) => h.completionDates.includes(iso));
    const cursor = parseIsoDate(TODAY);
    if (!isPerfect(TODAY)) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (isPerfect(toIsoDate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [active]);

  const weekDays = useMemo(() => {
    const ws = startOfWeek(new Date());
    ws.setDate(ws.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ws);
      d.setDate(ws.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const openHabit = (id: string) => router.push({ pathname: "/habit-detail", params: { id } });

  return (
    <Screen>
      <AddHabit onAdded={actions.add} />

      {isError && <Text className="text-red-500">Couldn&apos;t load your habits.</Text>}
      {!habits && !isError && (
        <View className="py-16">
          <ActivityIndicator color={c.primary} />
        </View>
      )}

      {habits && (
        <>
          {/* Week strip with ‹ / › pager */}
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setWeekOffset((o) => o - 1)}
              className="h-9 w-9 items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700"
            >
              <ChevronLeft color={c.text} size={18} />
            </Pressable>

            <View className="flex-1 flex-row justify-between">
              {weekDays.map((d) => {
                const iso = toIsoDate(d);
                const isSel = iso === selected;
                const future = iso > TODAY;
                const frac = dayFraction(iso);
                const full = frac >= 1 && active.length > 0;
                return (
                  <Pressable
                    key={iso}
                    disabled={future}
                    onPress={() => setSelected(iso)}
                    // Border is always 2px (color-only change on select) so selecting a day never
                    // resizes the box — the layout shift was what made fills collapse on Fabric.
                    className={`relative h-14 w-9 items-center justify-center overflow-hidden rounded-lg border-2 bg-neutral-100 dark:bg-neutral-800 ${
                      isSel ? "border-blue-600" : "border-transparent"
                    } ${future ? "opacity-40" : ""}`}
                  >
                    {/* Green fill rises with the share of habits done that day; full = brighter.
                        PIXEL height (not %) + absolute position so it always resolves on Fabric. */}
                    {frac > 0 ? (
                      <View
                        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: Math.round(frac * 56) }}
                        className={full ? "bg-emerald-500" : "bg-emerald-600"}
                      />
                    ) : null}
                    <Text className="text-[10px] font-medium text-neutral-900 dark:text-neutral-50">
                      {DOW[d.getDay()]}
                    </Text>
                    <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                      {d.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              disabled={weekOffset >= 0}
              onPress={() => setWeekOffset((o) => Math.min(0, o + 1))}
              className={`h-9 w-9 items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 ${weekOffset >= 0 ? "opacity-30" : ""}`}
            >
              <ChevronRight color={c.text} size={18} />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{dayLabel(selected)}</Text>
            {perfectStreak > 0 ? (
              <View className="rounded-full bg-emerald-500/15 px-2 py-0.5">
                <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  🔥 {perfectStreak}-day streak
                </Text>
              </View>
            ) : null}
          </View>

          {active.length === 0 ? (
            <View className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
              <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                No active habits. Add the daily actions that drive your goals.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {active.map((h) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  done={h.completionDates.includes(selected)}
                  onToggle={() => {
                    tapHaptic();
                    actions.toggle(h, selected);
                  }}
                  onOpen={() => openHabit(h.id)}
                />
              ))}
            </View>
          )}

          {archived.length > 0 && (
            <View className="mt-4 gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Archived</Text>
              {archived.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => openHabit(h.id)}
                  className="rounded-xl border border-neutral-200 p-3 active:opacity-70 dark:border-neutral-800"
                >
                  <Text className="text-neutral-700 dark:text-neutral-300" numberOfLines={1}>
                    {h.name}
                  </Text>
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                    🔥 {h.currentStreak} · {h.completionRate}%
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function HabitRow({
  habit,
  done,
  onToggle,
  onOpen,
}: {
  habit: Habit;
  done: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        className={`h-7 w-7 items-center justify-center rounded-full border-2 active:opacity-70 ${
          done ? "border-blue-600 bg-blue-600" : "border-neutral-300 dark:border-neutral-600"
        }`}
      >
        {done ? <Text className="text-xs text-white">✓</Text> : null}
      </Pressable>
      <Pressable onPress={onOpen} className="flex-1">
        <Text className="text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {habit.name}
        </Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          🔥 {habit.currentStreak} · {habit.completionRate}% · best {habit.longestStreak}
        </Text>
      </Pressable>
    </View>
  );
}

/** Inline "add a habit" row. */
function AddHabit({ onAdded }: { onAdded: (habit: Habit) => void }) {
  const c = useColors();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      const habit = await habitApi.create({ name: trimmed });
      onAdded(habit);
      setName("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-row items-center gap-2">
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="New habit"
        placeholderTextColor={c.muted}
        onSubmitEditing={submit}
        returnKeyType="done"
        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
      />
      <Pressable
        onPress={submit}
        disabled={!name.trim() || busy}
        className={`rounded-lg bg-blue-600 px-4 py-2.5 ${!name.trim() || busy ? "opacity-50" : "active:opacity-80"}`}
      >
        <Text className="font-semibold text-white">Add</Text>
      </Pressable>
    </View>
  );
}
