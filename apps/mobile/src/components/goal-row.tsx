import { Text, View } from "react-native";

import type { Goal, GoalStatus } from "@twy/core";

const STATUS_STYLE: Record<GoalStatus, string> = {
  DONE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  THIS_WEEK: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  UPCOMING: "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  MISSED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

/** Read-only weekly-goal row: week chip + title + status badge. */
export function GoalRow({ goal }: { goal: Goal }) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
      <View className="h-8 w-8 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
        <Text className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">W{goal.week}</Text>
      </View>
      <Text className="flex-1 text-neutral-900 dark:text-neutral-50" numberOfLines={2}>
        {goal.title}
      </Text>
      <Text className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[goal.status]}`}>
        {goal.status.replace("_", " ").toLowerCase()}
      </Text>
    </View>
  );
}
