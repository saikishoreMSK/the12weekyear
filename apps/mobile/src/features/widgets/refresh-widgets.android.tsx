// Renders raw widget functions for react-native-android-widget — opt out of the React Compiler.
"use no memo";

import { Appearance } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

import { quoteOfTheDay } from "@twy/core";
import type { WidgetSnapshot } from "./snapshot";
import {
  QuarterCountdownWidget,
  QuarterWidget,
  QuoteWidget,
  StreakWidget,
  TodayHabitsWidget,
  TodayProgressWidget,
  WeekWidget,
  WIDGET_COLORS,
} from "./widgets";

/**
 * Push a live update to every placed widget from the given snapshot. Called from useWidgetSnapshot
 * (a plain, reliably-running hook) so widgets refresh promptly on any data change — the previous
 * setup pushed from a hook whose effect wasn't reliably running, which is why widgets lagged.
 */
export function refreshWidgets(snap: WidgetSnapshot): void {
  const colors = WIDGET_COLORS[Appearance.getColorScheme() === "dark" ? "dark" : "light"];
  const notFound = () => {};

  void requestWidgetUpdate({
    widgetName: "Quote",
    renderWidget: (i) => <QuoteWidget quote={quoteOfTheDay()} colors={colors} width={i.width} height={i.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "Quarter",
    renderWidget: (i) => <QuarterWidget quarter={snap.quarter} colors={colors} width={i.width} height={i.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "Week",
    renderWidget: (i) => <WeekWidget week={snap.week} colors={colors} width={i.width} height={i.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "TodayHabits",
    renderWidget: (i) => <TodayHabitsWidget habits={snap.habits} colors={colors} width={i.width} height={i.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "TodayProgress",
    renderWidget: (i) => <TodayProgressWidget habits={snap.habits} colors={colors} width={i.width} height={i.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "QuarterCountdown",
    renderWidget: (i) => <QuarterCountdownWidget quarter={snap.quarter} colors={colors} width={i.width} height={i.height} />,
    widgetNotFound: notFound,
  });
  void requestWidgetUpdate({
    widgetName: "Streak",
    renderWidget: (i) => <StreakWidget streak={snap.streak} colors={colors} width={i.width} height={i.height} />,
    widgetNotFound: notFound,
  });
}
