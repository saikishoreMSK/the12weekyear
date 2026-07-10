// The widget JSX rendered here must stay raw functions for react-native-android-widget.
"use no memo";

import { useEffect } from "react";
import { AppState, useColorScheme } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

import { quoteOfTheDay, useCurrentQuarter, useHabits, type Habit, type Quarter } from "@twy/core";
import { buildWidgetSnapshot } from "./snapshot";
import { QuarterWidget, QuoteWidget, TodayHabitsWidget, WeekWidget, WIDGET_COLORS, type WidgetColors } from "./widgets";

/**
 * Push a live update to any placed widgets. The snapshot PERSISTENCE lives in useWidgetSnapshot (a
 * plain module) — this hook only handles the native live-push, so the write path never depends on
 * react-native-android-widget.
 */
function syncWidgets(quarter: Quarter | undefined, habits: Habit[] | undefined, colors: WidgetColors): void {
  const snap = buildWidgetSnapshot(quarter, habits);
  const notFound = () => {};
  void requestWidgetUpdate({
    widgetName: "Quote",
    renderWidget: (info) => <QuoteWidget quote={quoteOfTheDay()} colors={colors} width={info.width} height={info.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "Quarter",
    renderWidget: (info) => <QuarterWidget quarter={snap.quarter} colors={colors} width={info.width} height={info.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "Week",
    renderWidget: (info) => <WeekWidget week={snap.week} colors={colors} width={info.width} height={info.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "TodayHabits",
    renderWidget: (info) => <TodayHabitsWidget habits={snap.habits} colors={colors} width={info.width} height={info.height} />,
    widgetNotFound: notFound,
  });
}

/**
 * Pushes live widget updates whenever the data changes AND every time the app returns to the
 * foreground — so a widget added while the app was open still gets data. Persistence is handled
 * separately by useWidgetSnapshot.
 */
export function useSyncWidgets(): void {
  const { data: quarter } = useCurrentQuarter();
  const { data: habits } = useHabits();
  const colors = WIDGET_COLORS[useColorScheme() === "dark" ? "dark" : "light"];

  useEffect(() => {
    syncWidgets(quarter, habits, colors);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") syncWidgets(quarter, habits, colors);
    });
    return () => sub.remove();
  }, [quarter, habits, colors]);
}
