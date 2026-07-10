import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Check, Pencil, X } from "lucide-react-native";

import type { Goal, GoalStatus } from "@twy/core";
import { tapHaptic } from "@/lib/haptics";
import { useColors } from "@/theme";

const STATUS_STYLE: Record<GoalStatus, string> = {
  DONE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  THIS_WEEK: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  UPCOMING: "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  MISSED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

/**
 * Weekly-goal row: tappable done checkbox (optimistic) + status badge. When `onRename` is provided,
 * a pencil lets you edit the goal title inline (fast + offline via the optimistic rename action).
 */
export function GoalRow({
  goal,
  onToggle,
  onRename,
}: {
  goal: Goal;
  onToggle: () => void;
  onRename?: (title: string) => void;
}) {
  const c = useColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal.title);

  function startEdit() {
    setDraft(goal.title);
    setEditing(true);
  }
  function save() {
    const t = draft.trim();
    setEditing(false);
    if (t && t !== goal.title) onRename?.(t);
  }

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
      <Pressable
        onPress={() => {
          tapHaptic();
          onToggle();
        }}
        hitSlop={6}
        className={`h-6 w-6 items-center justify-center rounded-full border-2 active:opacity-70 ${
          goal.done ? "border-emerald-500 bg-emerald-500" : "border-neutral-300 dark:border-neutral-600"
        }`}
      >
        {goal.done ? <Text className="text-[11px] text-white">✓</Text> : null}
      </Pressable>

      <View className="flex-1">
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            autoFocus
            maxLength={120}
            placeholder="Goal title"
            placeholderTextColor={c.muted}
            returnKeyType="done"
            onSubmitEditing={save}
            className="border-b border-neutral-300 pb-1 text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
          />
        ) : (
          <Text
            className={`text-neutral-900 dark:text-neutral-50 ${goal.done ? "text-neutral-400 line-through dark:text-neutral-500" : ""}`}
            numberOfLines={2}
          >
            {goal.title}
          </Text>
        )}
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">Week {goal.week}</Text>
      </View>

      {editing ? (
        <View className="flex-row items-center gap-1">
          <Pressable onPress={save} hitSlop={8} className="p-1 active:opacity-60">
            <Check color="#16a34a" size={18} />
          </Pressable>
          <Pressable onPress={() => setEditing(false)} hitSlop={8} className="p-1 active:opacity-60">
            <X color={c.muted} size={18} />
          </Pressable>
        </View>
      ) : (
        <>
          <Text className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[goal.status]}`}>
            {goal.status.replace("_", " ").toLowerCase()}
          </Text>
          {onRename ? (
            <Pressable onPress={startEdit} hitSlop={8} className="p-1 active:opacity-60">
              <Pencil color={c.muted} size={15} />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}
