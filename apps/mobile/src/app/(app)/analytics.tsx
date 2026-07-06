import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { lastNDates, useAnalytics, type Analytics, type HeatmapDay } from "@twy/core";
import { Screen } from "@/components/screen";
import { useColors } from "@/theme";

const WEEKDAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function titleCase(day: string | null): string {
  if (!day) return "—";
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export default function AnalyticsScreen() {
  const { data, isError } = useAnalytics();
  const c = useColors();
  const router = useRouter();

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center gap-2">
        <ChevronLeft color={c.text} size={22} onPress={() => router.back()} />
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Analytics</Text>
      </View>

      {isError && <Text className="text-red-500">Couldn&apos;t load analytics.</Text>}
      {!data && !isError && (
        <View className="py-16">
          <ActivityIndicator color={c.primary} />
        </View>
      )}

      {data && (
        <>
          <View className="flex-row flex-wrap gap-3">
            <Stat label="Current streak" value={`${data.currentStreak}`} suffix="days" />
            <Stat label="Longest streak" value={`${data.longestStreak}`} suffix="days" />
            <Stat label="Best day" value={titleCase(data.bestDayOfWeek)} />
            <Stat label="Worst day" value={titleCase(data.worstDayOfWeek)} />
          </View>

          <Card title="Activity">
            <Heatmap heatmap={data.heatmap} />
          </Card>

          <Card title="By day of week">
            <WeekdayBars data={data} />
          </Card>

          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {data.totalCompletions} completions across {data.activeDays} active days.
          </Text>
        </>
      )}
    </Screen>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <View className="min-w-[47%] flex-1 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <Text className="text-xs text-neutral-500 dark:text-neutral-400">{label}</Text>
      <Text className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-50">
        {value}
        {suffix ? <Text className="text-xs font-normal text-neutral-500 dark:text-neutral-400"> {suffix}</Text> : null}
      </Text>
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</Text>
      {children}
    </View>
  );
}

function heatColor(count: number): string {
  if (count <= 0) return "bg-neutral-200 dark:bg-neutral-800";
  if (count === 1) return "bg-blue-300 dark:bg-blue-900";
  if (count === 2) return "bg-blue-500 dark:bg-blue-700";
  return "bg-blue-600 dark:bg-blue-500";
}

/** Compact GitHub-style heatmap of the last 12 weeks (7 rows × 12 columns). */
function Heatmap({ heatmap }: { heatmap: HeatmapDay[] }) {
  const counts = new Map(heatmap.map((h) => [h.date, h.count]));
  const days = lastNDates(84); // 12 weeks
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 3 }}>
      {weeks.map((week) => (
        <View key={week[0]} className="gap-[3px]">
          {week.map((iso) => (
            <View key={iso} className={`h-3.5 w-3.5 rounded-sm ${heatColor(counts.get(iso) ?? 0)}`} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function WeekdayBars({ data }: { data: Analytics }) {
  const byDay = new Map(data.weekdayCounts.map((w) => [w.dayOfWeek, w.count]));
  const max = Math.max(1, ...data.weekdayCounts.map((w) => w.count));
  return (
    <View className="gap-2">
      {WEEKDAY_ORDER.map((day) => {
        const count = byDay.get(day) ?? 0;
        return (
          <View key={day} className="flex-row items-center gap-2">
            <Text className="w-9 text-xs text-neutral-500 dark:text-neutral-400">{day.slice(0, 3)}</Text>
            <View className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <View className="h-full rounded-full bg-blue-600" style={{ width: `${(count / max) * 100}%` }} />
            </View>
            <Text className="w-6 text-right text-xs text-neutral-500 dark:text-neutral-400">{count}</Text>
          </View>
        );
      })}
    </View>
  );
}
