import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { quarterApi, useGoalActions, type Quarter, type QuarterHabit } from "@twy/core";
import { GoalRow } from "@/components/goal-row";
import { useColors } from "@/theme";

/** Full quarter view (score + weekly goals + add-goal + today's habits + reviews link). */
export function QuarterView({ quarter }: { quarter: Quarter }) {
  const goalActions = useGoalActions();
  const qc = useQueryClient();
  const router = useRouter();

  const takenWeeks = new Set(quarter.goals.map((g) => g.week));
  const sortedGoals = quarter.goals.slice().sort((a, b) => a.week - b.week);

  return (
    <>
      <View>
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Q{quarter.quarterNumber} · {quarter.label} {quarter.year}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {quarter.title ? `${quarter.title} · ` : ""}
          {quarter.state.toLowerCase()}
        </Text>
      </View>

      {/* Score card */}
      <View className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Quarter Score</Text>
            <Text className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">{quarter.sprintScore}%</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">Goals {quarter.goalsProgress}%</Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">Habits {quarter.habitsConsistency}%</Text>
          </View>
        </View>
        <ProgressBar value={quarter.sprintScore} />
        <View className="mt-3 flex-row justify-between">
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {quarter.currentDay
              ? `Day ${quarter.currentDay} / ${quarter.totalDays}`
              : quarter.state === "UPCOMING"
                ? `Starts ${quarter.startDate}`
                : "Quarter complete"}
          </Text>
          {quarter.currentWeek ? (
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              Week {quarter.currentWeek} / {quarter.totalWeeks}
            </Text>
          ) : null}
        </View>
      </View>

      {quarter.objective ? (
        <Text className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          {quarter.objective}
        </Text>
      ) : null}

      {/* Weekly goals */}
      <View className="gap-2">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Weekly goals</Text>
        {sortedGoals.length === 0 ? (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">No goals yet — add one per week.</Text>
        ) : (
          <View className="gap-2">
            {sortedGoals.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                onToggle={() => goalActions.toggle(quarter.id, goal, quarter.currentWeek)}
              />
            ))}
          </View>
        )}
        <AddGoal
          totalWeeks={quarter.totalWeeks}
          takenWeeks={takenWeeks}
          defaultWeek={quarter.currentWeek ?? 1}
          onAdd={async (title, week) => {
            await quarterApi.addGoal(quarter.id, { title, week });
            qc.invalidateQueries({ queryKey: ["quarter"] });
          }}
        />
      </View>

      {/* Today's habits */}
      <View className="gap-2">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Today&apos;s habits</Text>
        {quarter.habits.length === 0 ? (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">No habits yet.</Text>
        ) : (
          <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
            {quarter.habits.map((h, i) => (
              <QuarterHabitRow key={h.id} habit={h} first={i === 0} />
            ))}
          </View>
        )}
      </View>

      <Pressable
        onPress={() => router.push({ pathname: "/review", params: { quarterId: quarter.id, week: String(quarter.currentWeek ?? 1) } })}
        className="items-center rounded-lg border border-neutral-300 py-3 active:opacity-70 dark:border-neutral-700"
      >
        <Text className="font-medium text-neutral-700 dark:text-neutral-300">Weekly reviews</Text>
      </Pressable>
    </>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
      <View className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </View>
  );
}

function QuarterHabitRow({ habit, first }: { habit: QuarterHabit; first: boolean }) {
  return (
    <View className={`flex-row items-center justify-between p-3 ${first ? "" : "border-t border-neutral-200 dark:border-neutral-800"}`}>
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
            habit.completedToday ? "border-emerald-500 bg-emerald-500" : "border-neutral-300 dark:border-neutral-600"
          }`}
        >
          {habit.completedToday ? <Text className="text-xs text-white">✓</Text> : null}
        </View>
        <Text className="flex-1 text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {habit.name}
        </Text>
      </View>
      <Text className="text-xs text-neutral-500 dark:text-neutral-400">
        🔥 {habit.currentStreak} · {habit.completionRate}%
      </Text>
    </View>
  );
}

/** Add a weekly goal: pick an available week + a title. */
function AddGoal({
  totalWeeks,
  takenWeeks,
  defaultWeek,
  onAdd,
}: {
  totalWeeks: number;
  takenWeeks: Set<number>;
  defaultWeek: number;
  onAdd: (title: string, week: number) => Promise<void>;
}) {
  const c = useColors();
  const available = Array.from({ length: totalWeeks }, (_, i) => i + 1).filter((w) => !takenWeeks.has(w));
  const initial = available.includes(defaultWeek) ? defaultWeek : (available[0] ?? 1);
  const [week, setWeek] = useState(initial);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  if (available.length === 0) return null;

  async function submit() {
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await onAdd(t, week);
      setTitle("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="mt-1 gap-2 rounded-xl border border-dashed border-neutral-300 p-3 dark:border-neutral-700">
      <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Add a goal</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {available.map((w) => (
          <Pressable
            key={w}
            onPress={() => setWeek(w)}
            className={`h-8 w-8 items-center justify-center rounded-md border ${
              w === week ? "border-blue-600 bg-blue-600" : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            <Text className={`text-xs ${w === week ? "text-white" : "text-neutral-700 dark:text-neutral-300"}`}>{w}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View className="flex-row items-center gap-2">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={`Week ${week} focus`}
          placeholderTextColor={c.muted}
          onSubmitEditing={submit}
          returnKeyType="done"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
        />
        <Pressable
          onPress={submit}
          disabled={!title.trim() || busy}
          className={`rounded-lg bg-blue-600 px-4 py-2.5 ${!title.trim() || busy ? "opacity-50" : "active:opacity-80"}`}
        >
          <Text className="font-semibold text-white">Add</Text>
        </Pressable>
      </View>
    </View>
  );
}
