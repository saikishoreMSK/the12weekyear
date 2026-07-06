import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import {
  habitApi,
  lastNDates,
  parseIsoDate,
  toIsoDate,
  useHabitActions,
  useHabits,
  type Habit,
} from "@twy/core";
import { Screen } from "@/components/screen";
import { useColors } from "@/theme";

const TODAY = toIsoDate(new Date());

function dayLabel(iso: string): string {
  if (iso === TODAY) return "Today";
  return parseIsoDate(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function HabitsScreen() {
  const { data: habits, isError } = useHabits();
  const actions = useHabitActions();
  const c = useColors();
  const [selected, setSelected] = useState(TODAY);
  const days = useMemo(() => lastNDates(7), []);

  const active = habits?.filter((h) => h.active) ?? [];
  const archived = habits?.filter((h) => !h.active) ?? [];

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
          {/* 7-day strip */}
          <View className="flex-row justify-between">
            {days.map((iso) => {
              const d = parseIsoDate(iso);
              const isSel = iso === selected;
              return (
                <Pressable
                  key={iso}
                  onPress={() => setSelected(iso)}
                  className={`w-11 items-center rounded-lg py-2 ${
                    isSel ? "bg-blue-600" : "bg-neutral-100 dark:bg-neutral-900"
                  }`}
                >
                  <Text
                    className={`text-[10px] ${isSel ? "text-blue-100" : "text-neutral-500 dark:text-neutral-400"}`}
                  >
                    {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                  </Text>
                  <Text
                    className={`text-base font-semibold ${isSel ? "text-white" : "text-neutral-900 dark:text-neutral-50"}`}
                  >
                    {d.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {dayLabel(selected)}
          </Text>

          {active.length === 0 ? (
            <View className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
              <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                No active habits. Add the daily actions that drive your goals.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {active.map((h) => (
                <HabitRow key={h.id} habit={h} onToggle={() => actions.toggle(h, selected)} done={h.completionDates.includes(selected)} />
              ))}
            </View>
          )}

          {archived.length > 0 && (
            <View className="mt-4 gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Archived
              </Text>
              {archived.map((h) => (
                <Text key={h.id} className="text-sm text-neutral-500 dark:text-neutral-400">
                  {h.name}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function HabitRow({ habit, done, onToggle }: { habit: Habit; done: boolean; onToggle: () => void }) {
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
      <View className="flex-1">
        <Text className="text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {habit.name}
        </Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          🔥 {habit.currentStreak} · {habit.completionRate}% · best {habit.longestStreak}
        </Text>
      </View>
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
