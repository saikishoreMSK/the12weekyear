import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { useAnalytics, useCurrentQuarter } from "@twy/core";
import { Screen } from "@/components/screen";

export default function ShareScreen() {
  const cardRef = useRef<View>(null);
  const { data: quarter } = useCurrentQuarter();
  const { data: analytics } = useAnalytics();
  const [busy, setBusy] = useState(false);

  const score = quarter?.sprintScore ?? 0;

  async function share() {
    if (busy) return;
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your progress" });
      }
    } catch {
      // user cancelled or capture unavailable — ignore
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      {/* Dark share card */}
      <View ref={cardRef} collapsable={false} className="gap-4 rounded-2xl bg-neutral-900 p-6">
        <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400">The 12 Week Year</Text>

        {quarter ? (
          <Text className="text-sm text-neutral-300">
            Q{quarter.quarterNumber} · {quarter.label} {quarter.year}
          </Text>
        ) : null}

        <View>
          <Text className="text-6xl font-bold text-white">{score}%</Text>
          <Text className="text-xs text-neutral-400">quarter score</Text>
        </View>

        <View className="h-px bg-neutral-700" />

        <View className="flex-row justify-between">
          <CardStat label="Goals" value={`${quarter?.goalsProgress ?? 0}%`} />
          <CardStat label="Habits" value={`${quarter?.habitsConsistency ?? 0}%`} />
          <CardStat label="Streak" value={`${analytics?.currentStreak ?? 0}🔥`} />
          <CardStat label="Best" value={`${analytics?.longestStreak ?? 0}`} />
        </View>

        <Text className="text-xs text-neutral-500">Consistency over intensity.</Text>
      </View>

      <Pressable
        onPress={share}
        disabled={busy}
        className={`items-center rounded-lg bg-neutral-900 py-3.5 dark:bg-neutral-100 ${busy ? "opacity-60" : "active:opacity-80"}`}
      >
        <Text className="font-semibold text-white dark:text-neutral-900">{busy ? "Preparing…" : "Share"}</Text>
      </Pressable>

      <Text className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        Shares a snapshot of your current quarter and streaks.
      </Text>
    </Screen>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-lg font-bold text-white">{value}</Text>
      <Text className="text-[10px] uppercase tracking-wide text-neutral-400">{label}</Text>
    </View>
  );
}
