import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { toIsoDate, useCurrentQuarter, useHabits, weekDates, weekRangeLabel } from "@twy/core";
import { Screen } from "@/components/screen";
import { GoalRow } from "@/components/goal-row";
import { useColors } from "@/theme";

export default function WeekScreen() {
  const { data: quarter, isError: notPlanned } = useCurrentQuarter();
  const { data: habits } = useHabits();
  const c = useColors();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Default to the quarter's current week once it loads.
  useEffect(() => {
    if (quarter && selectedWeek === null) setSelectedWeek(quarter.currentWeek ?? 1);
  }, [quarter, selectedWeek]);

  if (notPlanned) {
    return (
      <Screen>
        <View className="mt-16 items-center">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            No quarter planned yet
          </Text>
          <Text className="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Plan the current quarter to see your week.
          </Text>
        </View>
      </Screen>
    );
  }

  if (!quarter || selectedWeek === null) {
    return (
      <Screen>
        <View className="py-16">
          <ActivityIndicator color={c.primary} />
        </View>
      </Screen>
    );
  }

  const activeHabits = habits?.filter((h) => h.active) ?? [];
  const goal = quarter.goals.find((g) => g.week === selectedWeek);
  const days = weekDates(quarter.startDate, quarter.endDate, selectedWeek);

  return (
    <Screen>
      <View>
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Week {selectedWeek}
          {quarter.currentWeek === selectedWeek ? (
            <Text className="text-sm font-normal text-neutral-500 dark:text-neutral-400"> · this week</Text>
          ) : null}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {weekRangeLabel(quarter.startDate, quarter.endDate, selectedWeek)} · Q{quarter.quarterNumber}{" "}
          {quarter.year}
        </Text>
      </View>

      {/* Week selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {Array.from({ length: quarter.totalWeeks }, (_, i) => i + 1).map((w) => {
          const active = w === selectedWeek;
          const isCurrent = quarter.currentWeek === w;
          return (
            <Pressable
              key={w}
              onPress={() => setSelectedWeek(w)}
              className={`h-9 w-9 items-center justify-center rounded-md border ${
                active
                  ? "border-blue-600 bg-blue-600"
                  : isCurrent
                    ? "border-blue-400 dark:border-blue-500"
                    : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              <Text
                className={`text-sm ${active ? "font-semibold text-white" : "text-neutral-700 dark:text-neutral-300"}`}
              >
                {w}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Week goal */}
      <View className="gap-2">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Week {selectedWeek} goal
        </Text>
        {goal ? (
          <GoalRow goal={goal} />
        ) : (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">No goal set for this week.</Text>
        )}
      </View>

      {/* Habit completion grid */}
      <View className="gap-2">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Habit completion</Text>
        {activeHabits.length === 0 ? (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">No habits yet.</Text>
        ) : (
          <View className="gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            {/* Day-of-week header */}
            <View className="flex-row">
              <View className="flex-1" />
              {days.map((d) => (
                <Text
                  key={toIsoDate(d)}
                  className="w-7 text-center text-[10px] text-neutral-400"
                >
                  {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                </Text>
              ))}
            </View>
            {activeHabits.map((h) => (
              <View key={h.id} className="flex-row items-center">
                <Text className="flex-1 text-sm text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
                  {h.name}
                </Text>
                {days.map((d) => {
                  const done = h.completionDates.includes(toIsoDate(d));
                  return (
                    <View key={toIsoDate(d)} className="w-7 items-center">
                      <View
                        className={`h-4 w-4 rounded-full ${
                          done ? "bg-blue-600" : "bg-neutral-200 dark:bg-neutral-700"
                        }`}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
