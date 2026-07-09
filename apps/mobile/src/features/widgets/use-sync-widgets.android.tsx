// The widget JSX rendered here must stay raw functions for react-native-android-widget.
"use no memo";

import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

import { quoteOfTheDay, toIsoDate, useCurrentQuarter, useHabits, weekDates } from "@twy/core";
import { saveWidgetSnapshot, type WidgetSnapshot } from "./snapshot";
import { QuarterWidget, QuoteWidget, TodayHabitsWidget, WeekWidget, WIDGET_COLORS } from "./widgets";

/**
 * Keeps the home-screen widgets in sync: writes a snapshot (read by the headless task handler when
 * the app is closed) and pushes a live update to any placed widgets whenever the data changes.
 */
export function useSyncWidgets(): void {
  const { data: quarter } = useCurrentQuarter();
  const { data: habits } = useHabits();
  const colors = WIDGET_COLORS[useColorScheme() === "dark" ? "dark" : "light"];

  useEffect(() => {
    const activeHabits = (habits ?? []).filter((h) => h.active);
    const today = toIsoDate(new Date());
    const habitsSnap = activeHabits.map((h) => ({
      name: h.name,
      done: h.completionDates.includes(today),
    }));

    let quarterSnap: WidgetSnapshot["quarter"] = null;
    let weekSnap: WidgetSnapshot["week"] = null;
    if (quarter) {
      quarterSnap = {
        label: `Q${quarter.quarterNumber} · ${quarter.label}`,
        year: quarter.year,
        score: quarter.sprintScore,
        currentDay: quarter.currentDay,
        totalDays: quarter.totalDays,
      };
      const wk = quarter.currentWeek ?? 1;
      const goal = quarter.goals.find((g) => g.week === wk) ?? null;
      const days = weekDates(quarter.startDate, quarter.endDate, wk).map((d) =>
        activeHabits.some((h) => h.completionDates.includes(toIsoDate(d))),
      );
      weekSnap = { number: wk, goalTitle: goal?.title ?? null, goalDone: goal?.done ?? false, days };
    }

    const snapshot: WidgetSnapshot = { quarter: quarterSnap, week: weekSnap, habits: habitsSnap };
    void saveWidgetSnapshot(snapshot);

    const notFound = () => {};
    void requestWidgetUpdate({
      widgetName: "Quote",
      renderWidget: (info) => <QuoteWidget quote={quoteOfTheDay()} colors={colors} width={info.width} height={info.height} />,
      widgetNotFound: notFound,
    });
    void requestWidgetUpdate({
      widgetName: "Quarter",
      renderWidget: (info) => <QuarterWidget quarter={quarterSnap} colors={colors} width={info.width} height={info.height} />,
      widgetNotFound: notFound,
    });
    void requestWidgetUpdate({
      widgetName: "Week",
      renderWidget: (info) => <WeekWidget week={weekSnap} colors={colors} width={info.width} height={info.height} />,
      widgetNotFound: notFound,
    });
    void requestWidgetUpdate({
      widgetName: "TodayHabits",
      renderWidget: (info) => <TodayHabitsWidget habits={habitsSnap} colors={colors} width={info.width} height={info.height} />,
      widgetNotFound: notFound,
    });
  }, [quarter, habits, colors]);
}
