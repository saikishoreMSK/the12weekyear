// react-native-android-widget renders raw functions; opt this file out of the React Compiler.
"use no memo";

import { Appearance } from "react-native";
import { FlexWidget, TextWidget, type WidgetTaskHandlerProps } from "react-native-android-widget";

import { quoteOfTheDay } from "@twy/core";
import { loadWidgetSnapshot } from "./snapshot";
import { QuarterWidget, QuoteWidget, TodayHabitsWidget, WeekWidget, WIDGET_COLORS } from "./widgets";

/**
 * Runs headless (even with the app closed) whenever Android needs to render/refresh a widget.
 * Reads the last snapshot the app wrote; the quote is computed directly (it's deterministic).
 * On any error it draws the message into the widget so it can be diagnosed without device logs.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const { widgetInfo, widgetAction, renderWidget } = props;
  if (widgetAction === "WIDGET_DELETED") return;

  const width = widgetInfo.width;
  const height = widgetInfo.height;

  try {
    const colors = WIDGET_COLORS[Appearance.getColorScheme() === "dark" ? "dark" : "light"];
    const snapshot = await loadWidgetSnapshot();
    const size = { width, height };

    // Quote needs no app data. The data widgets do: if the app hasn't written a snapshot yet, say so
    // explicitly (distinct from a real "no quarter planned") so it's clear the app must be opened once.
    if (widgetInfo.widgetName === "Quote") {
      renderWidget(<QuoteWidget quote={quoteOfTheDay()} colors={colors} {...size} />);
      return;
    }
    if (!snapshot) {
      renderWidget(
        <FlexWidget clickAction="OPEN_APP" style={{ width, height, backgroundColor: colors.card, borderRadius: 16, padding: 14, justifyContent: "center" }}>
          <TextWidget text="Open the app once to load your data" style={{ fontSize: 13, color: colors.muted }} />
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
