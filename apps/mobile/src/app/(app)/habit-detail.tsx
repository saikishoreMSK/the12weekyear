import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { habitApi, lastNDates, parseIsoDate, useHabitActions, useHabits } from "@twy/core";
import { Screen } from "@/components/screen";
import { tapHaptic } from "@/lib/haptics";
import { useColors } from "@/theme";

export default function HabitDetailScreen() {
  const id = useLocalSearchParams<{ id?: string }>().id ?? "";
  const router = useRouter();
  const c = useColors();
  const { data: habits } = useHabits();
  const actions = useHabitActions();

  const habit = habits?.find((h) => h.id === id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (!habits) {
    return (
      <Screen>
        <View className="py-16">
          <ActivityIndicator color={c.primary} />
        </View>
      </Screen>
    );
  }
  if (!habit) {
    return (
      <Screen>
        <Text className="text-neutral-500 dark:text-neutral-400">Habit not found.</Text>
      </Screen>
    );
  }

  async function saveName() {
    if (!habit || !name.trim()) return;
    const updated = await habitApi.update(habit.id, { name: name.trim() });
    actions.update(updated);
    setEditing(false);
  }

  async function toggleArchive() {
    if (!habit) return;
    actions.update(await habitApi.update(habit.id, { active: !habit.active }));
  }

  function confirmDelete() {
    if (!habit) return;
    Alert.alert("Delete habit", "Delete this habit and its history? This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await habitApi.remove(habit.id);
          actions.remove(habit.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen>
      {editing ? (
        <View className="flex-row items-center gap-2">
          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
          />
          <Pressable onPress={saveName} className="rounded-lg bg-blue-600 px-4 py-2.5 active:opacity-80">
            <Text className="font-semibold text-white">Save</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">{habit.name}</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => {
                setName(habit.name);
                setEditing(true);
              }}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 dark:border-neutral-700"
            >
              <Text className="text-sm text-neutral-700 dark:text-neutral-300">Rename</Text>
            </Pressable>
            <Pressable onPress={toggleArchive} className="rounded-lg border border-neutral-300 px-3 py-1.5 dark:border-neutral-700">
              <Text className="text-sm text-neutral-700 dark:text-neutral-300">{habit.active ? "Archive" : "Resume"}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!habit.active ? (
        <Text className="rounded-md bg-neutral-100 px-3 py-2 text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          This habit is archived — hidden from your daily tracker until you resume it.
        </Text>
      ) : null}

      <View className="flex-row flex-wrap gap-3">
        <Stat label="Current streak" value={`${habit.currentStreak}`} suffix="days" />
        <Stat label="Longest streak" value={`${habit.longestStreak}`} suffix="days" />
        <Stat label="Completion" value={`${habit.completionRate}%`} />
        <Stat label="Total done" value={`${habit.totalCompletions}`} />
      </View>

      <View className="gap-2">
        <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">Last 14 days</Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">Tap a day to mark it done or undo it.</Text>
        <View className="flex-row flex-wrap gap-2">
          {lastNDates(14).map((iso) => {
            const done = habit.completionDates.includes(iso);
            return (
              <Pressable
                key={iso}
                onPress={() => {
                  tapHaptic();
                  actions.toggle(habit, iso);
                }}
                className={`h-10 w-10 items-center justify-center rounded-md border ${
                  done ? "border-emerald-500 bg-emerald-500" : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                <Text className={done ? "text-sm text-white" : "text-sm text-neutral-500 dark:text-neutral-400"}>
                  {parseIsoDate(iso).getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable onPress={confirmDelete} className="mt-2 self-start">
        <Text className="text-sm font-medium text-red-600 dark:text-red-400">Delete habit</Text>
      </Pressable>
    </Screen>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <View className="min-w-[47%] flex-1 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <Text className="text-xs text-neutral-500 dark:text-neutral-400">{label}</Text>
      <Text className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-50">
        {value}
        {suffix ? <Text className="text-xs font-normal text-neutral-500 dark:text-neutral-400"> {suffix}</Text> : null}
      </Text>
    </View>
  );
}
