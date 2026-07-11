// react-native-android-widget renders raw functions; opt this file out of the React Compiler.
"use no memo";

import "@/lib/outbox"; // registers the offline write queue so queueWrite works in the headless task
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { FlexWidget, TextWidget, type WidgetTaskHandlerProps } from "react-native-android-widget";

import { queueWrite, quoteOfTheDay, toIsoDate } from "@twy/core";
import { refreshWidgets } from "./refresh-widgets";
import { loadWidgetSnapshot, saveWidgetSnapshot } from "./snapshot";
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
 * Runs headless (even with the app closed) whenever Android renders/refreshes a widget or a widget
 * is tapped. Reads the last snapshot the app wrote; the quote is computed directly. Tapping a habit
 * (TOGGLE_HABIT) flips today's completion in the snapshot and queues the write to the outbox, which
 * is replayed on the next app open (guest → local store, signed-in → cloud).
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const { widgetInfo, widgetAction, clickAction, clickActionData, renderWidget } = props;
  if (widgetAction === "WIDGET_DELETED") return;

  const width = widgetInfo.width;
  const height = widgetInfo.height;

  try {
    const colors = WIDGET_COLORS[Appearance.getColorScheme() === "dark" ? "dark" : "light"];
    const size = { width, height };
    const snapshot = await loadWidgetSnapshot();

    // Interactive: tap a habit row to toggle today's completion.
    if (clickAction === "TOGGLE_HABIT" && snapshot) {
      const habitId = String(clickActionData?.habitId ?? "");
      const habit = snapshot.habits.find((h) => h.id === habitId);
      if (habit) {
        habit.done = !habit.done;
        await saveWidgetSnapshot(snapshot);
        queueWrite({ kind: "completion", habitId, date: toIsoDate(new Date()), done: habit.done });
      }
      renderWidget(<TodayHabitsWidget habits={snapshot.habits} colors={colors} {...size} />);
      // Update every other placed widget too. Today's-progress recomputes exactly from the done
      // flags; the streak needs full history so it refreshes precisely on the next app open.
      refreshWidgets(snapshot);
      return;
    }

    // Quote needs no app data. The data widgets do: if the app hasn't written a snapshot yet, say so.
    if (widgetInfo.widgetName === "Quote") {
      renderWidget(<QuoteWidget quote={quoteOfTheDay()} colors={colors} {...size} />);
      return;
    }
    if (!snapshot) {
      let keys: readonly string[] = [];
      try {
        keys = await AsyncStorage.getAllKeys();
      } catch (err) {
        keys = [`ERR ${String(err)}`];
      }
      const twy = keys.filter((k) => k.startsWith("twy"));
      renderWidget(
        <FlexWidget clickAction="OPEN_APP" style={{ width, height, backgroundColor: colors.card, borderRadius: 16, padding: 10, justifyContent: "center", flexGap: 4 }}>
          <TextWidget text="Waiting for app data…" style={{ fontSize: 12, color: colors.text }} />
          <TextWidget text={`${keys.length} keys · twy: ${twy.join(", ") || "none"}`} style={{ fontSize: 9, color: colors.muted }} />
        </FlexWidget>,
      );
      return;
    }

    switch (widgetInfo.widgetName) {
      case "Quarter":
        renderWidget(<QuarterWidget quarter={snapshot.quarter} colors={colors} {...size} />);
        break;
      case "Week":
        renderWidget(<WeekWidget week={snapshot.week} colors={colors} {...size} />);
        break;
      case "TodayHabits":
        renderWidget(<TodayHabitsWidget habits={snapshot.habits} colors={colors} {...size} />);
        break;
      case "TodayProgress":
        renderWidget(<TodayProgressWidget habits={snapshot.habits} colors={colors} {...size} />);
        break;
      case "QuarterCountdown":
        renderWidget(<QuarterCountdownWidget quarter={snapshot.quarter} colors={colors} {...size} />);
        break;
      case "Streak":
        renderWidget(<StreakWidget streak={snapshot.streak} colors={colors} {...size} />);
        break;
    }
  } catch (e) {
    renderWidget(
      <FlexWidget
        clickAction="OPEN_APP"
        style={{ width, height, backgroundColor: "#7f1d1d", padding: 10, justifyContent: "center" }}
      >
        <TextWidget text={`Widget error: ${String(e)}`} style={{ fontSize: 11, color: "#ffffff" }} />
      </FlexWidget>,
    );
  }
}
