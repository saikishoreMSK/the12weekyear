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
  const streak = analytics?.currentStreak ?? 0;

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
      <View ref={cardRef} collapsable={false} className="gap-3 rounded-2xl bg-blue-600 p-6">
        <Text className="text-sm font-semibold text-white">The 12 Week Year</Text>
        {quarter ? (
          <Text className="text-base text-white">
            Q{quarter.quarterNumber} · {quarter.label} {quarter.year}
          </Text>
        ) : null}
        <Text className="text-6xl font-bold text-white">{score}%</Text>
        <Text className="text-base text-white">🔥 {streak}-day streak</Text>
        <Text className="text-xs text-white">Consistency over intensity.</Text>
      </View>

      <Pressable
        onPress={share}
        disabled={busy}
        className={`items-center rounded-lg bg-blue-600 py-3.5 ${busy ? "opacity-60" : "active:opacity-80"}`}
      >
        <Text className="font-semibold text-white">{busy ? "Preparing…" : "Share"}</Text>
      </Pressable>

      <Text className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        Shares a snapshot of your current quarter and streak.
      </Text>
    </Screen>
  );
}
