import { useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { parseIsoDate, toIsoDate, useAnalytics, useHabits, type HeatmapDay } from "@twy/core";
import { Screen } from "@/components/screen";
import { useColors } from "@/theme";

const WEEKDAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const JS_DAY_KEY = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function titleCase(day: string | null): string {
  if (!day) return "—";
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export default function AnalyticsScreen() {
  const { data, isError } = useAnalytics();
  const { data: habits } = useHabits();
  const c = useColors();

  // Weekday breakdown, derived on-device from cached completions over the backend's window — instant
  // and realtime (updates as you toggle habits) instead of waiting on the analytics refetch.
  const weekdayCounts = useMemo(() => {
    const counts = new Map<string, number>(WEEKDAY_ORDER.map((d) => [d, 0]));
    if (!data || !habits) return counts;
    for (const h of habits) {
      for (const iso of h.completionDates) {
        if (iso < data.windowStart || iso > data.windowEnd) continue;
        const key = JS_DAY_KEY[parseIsoDate(iso).getDay()];
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return counts;
  }, [habits, data]);

  // Best/worst day recomputed from the same counts so the stats agree with the bars.
  const { best, worst } = useMemo(() => {
    let bDay: string | null = null;
    let wDay: string | null = null;
    let bMax = -1;
    let wMin = Infinity;
    let any = false;
    for (const day of WEEKDAY_ORDER) {
      const count = weekdayCounts.get(day) ?? 0;
      if (count > 0) any = true;
      if (count > bMax) {
        bMax = count;
        bDay = day;
      }
      if (count < wMin) {
        wMin = count;
        wDay = day;
      }
    }
    if (!any) return { best: data?.bestDayOfWeek ?? null, worst: data?.worstDayOfWeek ?? null };
    return { best: bDay, worst: wDay };
  }, [weekdayCounts, data]);

  return (
    <Screen>
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
            <Stat label="Best day" value={titleCase(best)} />
            <Stat label="Worst day" value={titleCase(worst)} />
          </View>

          <Card title="Activity">
            <Heatmap windowStart={data.windowStart} windowEnd={data.windowEnd} heatmap={data.heatmap} />
          </Card>

          <Card title="By day of week">
            <WeekdayBars counts={weekdayCounts} />
          </Card>

          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {data.totalCompletions} completions across {data.activeDays} active{" "}
            {data.activeDays === 1 ? "day" : "days"} (days with at least one habit done).
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

interface Cell {
  iso: string;
  count: number | null; // null = padding outside the window
}
interface MonthGroup {
  key: string;
  label: string;
  weeks: Cell[][];
}

function heatClass(count: number | null): string {
  if (count === null) return "bg-transparent";
  if (count === 0) return "bg-neutral-200 dark:bg-neutral-800";
  if (count === 1) return "bg-emerald-200 dark:bg-emerald-900";
  if (count === 2) return "bg-emerald-300 dark:bg-emerald-700";
  if (count === 3) return "bg-emerald-400 dark:bg-emerald-600";
  return "bg-emerald-500";
}

/** GitHub-style contribution grid: one column per week (Sun→Sat), grouped by month. Mirrors web. */
function Heatmap({
  windowStart,
  windowEnd,
  heatmap,
}: {
  windowStart: string;
  windowEnd: string;
  heatmap: HeatmapDay[];
}) {
  const groups = useMemo<MonthGroup[]>(() => {
    const counts = new Map(heatmap.map((d) => [d.date, d.count]));
    const start = parseIsoDate(windowStart);
    const end = parseIsoDate(windowEnd);
    const cursor = new Date(start);
    cursor.setDate(start.getDate() - start.getDay()); // back to Sunday

    const result: MonthGroup[] = [];
    while (cursor <= end) {
      const anchor = new Date(cursor);
      const week: Cell[] = [];
      for (let i = 0; i < 7; i++) {
        const iso = toIsoDate(cursor);
        const inRange = cursor >= start && cursor <= end;
        week.push({ iso, count: inRange ? (counts.get(iso) ?? 0) : null });
        cursor.setDate(cursor.getDate() + 1);
      }
      const key = `${anchor.getFullYear()}-${anchor.getMonth()}`;
      const last = result[result.length - 1];
      if (last && last.key === key) last.weeks.push(week);
      else result.push({ key, label: MONTHS[anchor.getMonth()], weeks: [week] });
    }
    return result;
  }, [windowStart, windowEnd, heatmap]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row" style={{ gap: 10 }}>
        {groups.map((group) => (
          <View key={group.key} style={{ gap: 4 }}>
            <Text className="text-[10px] text-neutral-400">{group.label}</Text>
            <View className="flex-row" style={{ gap: 3 }}>
              {group.weeks.map((week, wi) => (
                <View key={wi} style={{ gap: 3 }}>
                  {week.map((cell) => (
                    <View key={cell.iso} className={`h-3 w-3 rounded-sm ${heatClass(cell.count)}`} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/** Vertical bar chart of completions per weekday. */
function WeekdayBars({ counts }: { counts: Map<string, number> }) {
  const max = Math.max(1, ...WEEKDAY_ORDER.map((d) => counts.get(d) ?? 0));
  return (
    <View className="flex-row items-end justify-between" style={{ gap: 8 }}>
      {WEEKDAY_ORDER.map((day) => {
        const count = counts.get(day) ?? 0;
        return (
          <View key={day} className="flex-1 items-center" style={{ gap: 4 }}>
            <Text className="text-[10px] text-neutral-500 dark:text-neutral-400">{count}</Text>
            <View className="h-20 w-full justify-end overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
              <View className="w-full rounded bg-blue-600" style={{ height: `${(count / max) * 100}%` }} />
            </View>
            <Text className="text-[10px] text-neutral-500 dark:text-neutral-400">{day.slice(0, 2)}</Text>
          </View>
        );
      })}
    </View>
  );
}
