import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { reviewApi } from "@twy/core";
import { Screen } from "@/components/screen";
import { useColors } from "@/theme";

const PROMPTS = [
  { key: "wentWell", label: "What went well?", placeholder: "e.g. Studied 2 hrs daily and stayed consistent at the gym" },
  { key: "wastedTime", label: "What wasted time?", placeholder: "e.g. Late-night scrolling; skipped meal prep" },
  { key: "biggestWin", label: "Biggest win?", placeholder: "e.g. Cleared a tough exam / wrapped a big project at work" },
  { key: "biggestBlocker", label: "Biggest blocker?", placeholder: "e.g. Poor sleep and a hectic week at the office" },
] as const;

type Fields = { wentWell: string; wastedTime: string; biggestWin: string; biggestBlocker: string };

export default function ReviewScreen() {
  const params = useLocalSearchParams<{ quarterId?: string; week?: string; totalWeeks?: string }>();
  const quarterId = params.quarterId ?? "";
  const totalWeeks = Number(params.totalWeeks) || 13;
  const c = useColors();
  const qc = useQueryClient();

  const [week, setWeek] = useState(Number(params.week) || 1);
  const { data: reviews } = useQuery({
    queryKey: ["reviews", quarterId],
    queryFn: () => reviewApi.list(quarterId),
    enabled: !!quarterId,
  });
  const current = reviews?.find((r) => r.weekNumber === week);

  const [fields, setFields] = useState<Fields>({ wentWell: "", wastedTime: "", biggestWin: "", biggestBlocker: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Prefill when the selected week (or its loaded review) changes.
  useEffect(() => {
    setFields({
      wentWell: current?.wentWell ?? "",
      wastedTime: current?.wastedTime ?? "",
      biggestWin: current?.biggestWin ?? "",
      biggestBlocker: current?.biggestBlocker ?? "",
    });
    setSaved(false);
  }, [current, week]);

  const reviewedWeeks = useMemo(() => new Set((reviews ?? []).map((r) => r.weekNumber)), [reviews]);

  async function save() {
    if (!quarterId || saving) return;
    setSaving(true);
    try {
      await reviewApi.save(quarterId, week, fields);
      qc.invalidateQueries({ queryKey: ["reviews", quarterId] });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Week {week} review</Text>

      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => {
          const on = w === week;
          return (
            <Pressable
              key={w}
              onPress={() => setWeek(w)}
              className={`h-9 w-9 items-center justify-center rounded-md border ${on ? "border-blue-600 bg-blue-600" : "border-neutral-300 dark:border-neutral-700"}`}
            >
              <Text className={`text-sm ${on ? "font-semibold text-white" : "text-neutral-700 dark:text-neutral-300"}`}>{w}</Text>
              <View className={`mt-0.5 h-1 w-1 rounded-full ${reviewedWeeks.has(w) ? (on ? "bg-white" : "bg-emerald-500") : "bg-transparent"}`} />
            </Pressable>
          );
        })}
      </View>

      {PROMPTS.map((p) => (
        <View key={p.key} className="gap-1">
          <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{p.label}</Text>
          <TextInput
            multiline
            value={fields[p.key]}
            onChangeText={(t) => {
              setFields((f) => ({ ...f, [p.key]: t }));
              setSaved(false);
            }}
            placeholder={p.placeholder}
            placeholderTextColor={c.muted}
            style={{ minHeight: 76, textAlignVertical: "top" }}
            className="rounded-lg border border-neutral-300 p-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
          />
        </View>
      ))}

      <Pressable
        onPress={save}
        disabled={saving}
        className={`items-center rounded-lg bg-blue-600 py-3.5 ${saving ? "opacity-60" : "active:opacity-80"}`}
      >
        <Text className="font-semibold text-white">{saving ? "Saving…" : saved ? "Saved ✓" : `Save week ${week}`}</Text>
      </Pressable>
    </Screen>
  );
}
