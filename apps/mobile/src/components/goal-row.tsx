import { Pressable, Text, View } from "react-native";

import type { Goal, GoalStatus } from "@twy/core";

const STATUS_STYLE: Record<GoalStatus, string> = {
  DONE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  THIS_WEEK: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  UPCOMING: "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  MISSED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

/** Weekly-goal row with a tappable done checkbox (optimistic) + status badge. */
export function GoalRow({ goal, onToggle }: { goal: Goal; onToggle: () => void }) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
      <Pressable
        onPress={onToggle}
        hitSlop={6}
        className={`h-6 w-6 items-center justify-center rounded-full border-2 active:opacity-70 ${
          goal.done ? "border-emerald-500 bg-emerald-500" : "border-neutral-300 dark:border-neutral-600"
        }`}
      >
        {goal.done ? <Text className="text-[11px] text-white">✓</Text> : null}
      </Pressable>

      <View className="flex-1">
        <Text
          className={`text-neutral-900 dark:text-neutral-50 ${goal.done ? "text-neutral-400 line-through dark:text-neutral-500" : ""}`}
          numberOfLines={2}
        >
          {goal.title}
        </Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">Week {goal.week}</Text>
      </View>

      <Text className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[goal.status]}`}>
        {goal.status.replace("_", " ").toLowerCase()}
      </Text>
    </View>
  );
}
