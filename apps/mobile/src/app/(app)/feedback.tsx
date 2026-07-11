import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { feedbackApi } from "@twy/core";
import { Screen } from "@/components/screen";
import { useColors } from "@/theme";

export default function FeedbackScreen() {
  const c = useColors();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    const m = message.trim();
    if (!m || busy) return;
    setBusy(true);
    setError("");
    try {
      await feedbackApi.submit({ message: m, rating: rating || undefined });
      setDone(true);
    } catch {
      setError("Couldn't send your feedback. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Screen>
        <View className="mt-16 items-center gap-3">
          <Text className="text-2xl">🙌</Text>
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Thanks for the feedback!</Text>
          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            It really helps make Quarterly better.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-2 rounded-lg bg-blue-600 px-6 py-3 active:opacity-80"
          >
            <Text className="font-semibold text-white">Done</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-50">We&apos;d love your feedback</Text>
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
        Tell us what&apos;s working, what isn&apos;t, or what you&apos;d like to see next.
      </Text>

      <View className="flex-row gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Pressable key={s} onPress={() => setRating(s)} hitSlop={6}>
            <Text className={`text-3xl ${s <= rating ? "text-amber-400" : "text-neutral-300 dark:text-neutral-600"}`}>
              {s <= rating ? "★" : "☆"}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        placeholder="Your feedback…"
        placeholderTextColor={c.muted}
        style={{ textAlignVertical: "top" }}
        className="min-h-36 rounded-lg border border-neutral-300 p-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
      />

      {error ? <Text className="text-sm text-red-500">{error}</Text> : null}

      <Pressable
        onPress={submit}
        disabled={!message.trim() || busy}
        className={`items-center rounded-lg bg-blue-600 py-3.5 ${!message.trim() || busy ? "opacity-50" : "active:opacity-80"}`}
      >
        <Text className="font-semibold text-white">{busy ? "Sending…" : "Send feedback"}</Text>
      </Pressable>
    </Screen>
  );
}
