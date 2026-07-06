import { ActivityIndicator, Text, View } from "react-native";

import { useCurrentQuarter, type QuarterHabit } from "@twy/core";
import { Screen } from "@/components/screen";
import { GoalRow } from "@/components/goal-row";
import { useColors } from "@/theme";

export default function QuarterScreen() {
  const { data: quarter, isError: notPlanned } = useCurrentQuarter();
  const c = useColors();

  if (notPlanned) {
    return (
      <Screen>
        <View className="mt-16 items-center">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            No quarter planned yet
          </Text>
          <Text className="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Plan the current quarter from the web app to start tracking here.
          </Text>
        </View>
      </Screen>
    );
  }

  if (!quarter) {
    return (
      <Screen>
        <View className="py-16">
          <ActivityIndicator color={c.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
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
            <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Quarter Score
            </Text>
            <Text className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
              {quarter.sprintScore}%
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              Goals {quarter.goalsProgress}%
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              Habits {quarter.habitsConsistency}%
            </Text>
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
        {quarter.goals.length === 0 ? (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">No goals yet.</Text>
        ) : (
          <View className="gap-2">
            {quarter.goals
              .slice()
              .sort((a, b) => a.week - b.week)
              .map((goal) => (
                <GoalRow key={goal.id} goal={goal} />
              ))}
          </View>
        )}
      </View>

      {/* Today's habits */}
      <View className="gap-2">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Today&apos;s habits
        </Text>
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
    </Screen>
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
    <View
      className={`flex-row items-center justify-between p-3 ${first ? "" : "border-t border-neutral-200 dark:border-neutral-800"}`}
    >
      <View className="flex-1 flex-row items-center gap-2">
        <Text className="text-base">{habit.completedToday ? "✅" : "⬜️"}</Text>
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
