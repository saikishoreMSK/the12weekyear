import { Appearance } from "react-native";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { quoteOfTheDay } from "@twy/core";
import { loadWidgetSnapshot } from "./snapshot";
import {
  QuarterWidget,
  QuoteWidget,
  TodayHabitsWidget,
  WeekWidget,
  WIDGET_COLORS,
} from "./widgets";

/**
 * Runs headless (even with the app closed) whenever Android needs to render/refresh a widget.
 * Reads the last snapshot the app wrote; the quote is computed directly (it's deterministic).
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const { widgetInfo, widgetAction, renderWidget } = props;
  if (widgetAction === "WIDGET_DELETED") return;

  const colors = WIDGET_COLORS[Appearance.getColorScheme() === "dark" ? "dark" : "light"];
  const snapshot = await loadWidgetSnapshot();
  const size = { width: widgetInfo.width, height: widgetInfo.height };

  switch (widgetInfo.widgetName) {
    case "Quote":
      renderWidget(<QuoteWidget quote={quoteOfTheDay()} colors={colors} {...size} />);
      break;
    case "Quarter":
      renderWidget(<QuarterWidget quarter={snapshot?.quarter ?? null} colors={colors} {...size} />);
      break;
    case "Week":
      renderWidget(<WeekWidget week={snapshot?.week ?? null} colors={colors} {...size} />);
      break;
    case "TodayHabits":
      renderWidget(<TodayHabitsWidget habits={snapshot?.habits ?? []} colors={colors} {...size} />);
      break;
  }
}
