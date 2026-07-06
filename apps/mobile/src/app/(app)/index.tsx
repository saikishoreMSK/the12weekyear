import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { quoteOfTheDay, useDashboard, type QuarterTile } from "@twy/core";
import { Screen } from "@/components/screen";
import { useColors } from "@/theme";

export default function DashboardScreen() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data, isError } = useDashboard(year);
  const router = useRouter();
  const c = useColors();
  const quote = quoteOfTheDay();

  return (
    <Screen>
      {/* Quote of the day */}
          <View className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <Text className="text-base leading-6 text-neutral-800 dark:text-neutral-100">
              “{quote.text}”
            </Text>
            <Text className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">— {quote.author}</Text>
          </View>

          {/* Year header + prev/next */}
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{year}</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setYear((y) => y - 1)}
                className="h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700"
              >
                <ChevronLeft color={c.text} size={18} />
              </Pressable>
              <Pressable
                onPress={() => setYear((y) => y + 1)}
                className="h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700"
              >
                <ChevronRight color={c.text} size={18} />
              </Pressable>
            </View>
          </View>

          {isError && <Text className="text-red-500">Couldn&apos;t load your year.</Text>}

          {!data && !isError && (
            <View className="py-10">
              <ActivityIndicator color={c.primary} />
            </View>
          )}

          {data && (
            <View className="flex-row flex-wrap gap-3">
              {data.quarters.map((q) => (
                <QuarterCard
                  key={q.quarterNumber}
                  tile={q}
                  onPress={() => {
                    if (q.planned) router.push("/quarter");
                  }}
                />
              ))}
            </View>
          )}
    </Screen>
  );
}

function QuarterCard({ tile, onPress }: { tile: QuarterTile; onPress: () => void }) {
  const heading = `Q${tile.quarterNumber} · ${tile.label}`;
  const base = "h-36 w-[48%] justify-between rounded-xl border p-4";

  if (!tile.planned) {
    return (
      <View
        className={`${base} border-dashed border-neutral-300 dark:border-neutral-700`}
      >
        <Text className="font-semibold text-neutral-900 dark:text-neutral-50">{heading}</Text>
        <Text className="text-xs text-neutral-400">Not planned yet</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className={`${base} border-neutral-200 active:opacity-70 dark:border-neutral-800`}
    >
      <View className="flex-row items-start justify-between gap-1">
        <Text className="flex-1 font-semibold text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {heading}
        </Text>
        <StateBadge state={tile.state} />
      </View>

      {tile.score !== null ? (
        <View>
          <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{tile.score}%</Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {tile.currentDay ? `Day ${tile.currentDay}/${tile.totalDays}` : `${tile.goalCount} goals`}
          </Text>
        </View>
      ) : (
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          {tile.goalCount} {tile.goalCount === 1 ? "goal" : "goals"} · starts soon
        </Text>
      )}
    </Pressable>
  );
}

function StateBadge({ state }: { state: QuarterTile["state"] }) {
  const cls =
    state === "ACTIVE"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : state === "COMPLETED"
        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
        : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";
  return (
    <Text className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {state.toLowerCase()}
    </Text>
  );
}
