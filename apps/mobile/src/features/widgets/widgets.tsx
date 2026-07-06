import { FlexWidget, TextWidget } from "react-native-android-widget";

import type { Quote } from "@twy/core";
import type { WidgetSnapshot } from "./snapshot";

export interface WidgetColors {
  card: `#${string}`;
  text: `#${string}`;
  muted: `#${string}`;
  primary: `#${string}`;
  done: `#${string}`;
  track: `#${string}`;
}

export const WIDGET_COLORS: { light: WidgetColors; dark: WidgetColors } = {
  light: { card: "#ffffff", text: "#0b0b0c", muted: "#6b7280", primary: "#2563eb", done: "#16a34a", track: "#e5e7eb" },
  dark: { card: "#161618", text: "#f5f5f5", muted: "#9ca3af", primary: "#3b82f6", done: "#22c55e", track: "#27272a" },
};

function root(c: WidgetColors, justify: "center" | "space-between" = "space-between") {
  return {
    height: "match_parent" as const,
    width: "match_parent" as const,
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: "column" as const,
    justifyContent: justify,
    flexGap: 6,
  };
}

export function QuoteWidget({ quote, colors: c }: { quote: Quote; colors: WidgetColors }) {
  return (
    <FlexWidget clickAction="OPEN_APP" style={root(c, "center")}>
      <TextWidget text={`“${quote.text}”`} style={{ fontSize: 14, color: c.text }} />
      <TextWidget text={`— ${quote.author}`} style={{ fontSize: 11, color: c.muted }} />
    </FlexWidget>
  );
}

export function QuarterWidget({ quarter, colors: c }: { quarter: WidgetSnapshot["quarter"]; colors: WidgetColors }) {
  if (!quarter) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={root(c, "center")}>
        <TextWidget text="No quarter planned" style={{ fontSize: 14, color: c.muted }} />
      </FlexWidget>
    );
  }
  return (
    <FlexWidget clickAction="OPEN_APP" style={root(c)}>
      <TextWidget text={`${quarter.label} ${quarter.year}`} style={{ fontSize: 13, color: c.muted }} />
      <TextWidget text={`${quarter.score}%`} style={{ fontSize: 34, fontWeight: "bold", color: c.text }} />
      <TextWidget
        text={quarter.currentDay ? `Day ${quarter.currentDay} / ${quarter.totalDays}` : ""}
        style={{ fontSize: 12, color: c.muted }}
      />
    </FlexWidget>
  );
}

export function WeekWidget({ week, colors: c }: { week: WidgetSnapshot["week"]; colors: WidgetColors }) {
  if (!week) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={root(c, "center")}>
        <TextWidget text="No quarter planned" style={{ fontSize: 14, color: c.muted }} />
      </FlexWidget>
    );
  }
  return (
    <FlexWidget clickAction="OPEN_APP" style={root(c)}>
      <TextWidget text={`Week ${week.number}`} style={{ fontSize: 15, fontWeight: "bold", color: c.text }} />
      <TextWidget
        text={week.goalTitle ?? "No goal set"}
        style={{ fontSize: 13, color: week.goalDone ? c.done : c.text }}
      />
      <FlexWidget style={{ flexDirection: "row", flexGap: 4, height: 16, width: "wrap_content" }}>
        {week.days.map((done, i) => (
          <FlexWidget
            key={String(i)}
            style={{ height: 14, width: 14, borderRadius: 4, backgroundColor: done ? c.primary : c.track }}
          />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}

export function TodayHabitsWidget({ habits, colors: c }: { habits: WidgetSnapshot["habits"]; colors: WidgetColors }) {
  const shown = habits.slice(0, 4);
  return (
    <FlexWidget clickAction="OPEN_APP" style={root(c, habits.length ? "space-between" : "center")}>
      <TextWidget text="Today" style={{ fontSize: 15, fontWeight: "bold", color: c.text }} />
      {shown.length === 0 ? (
        <TextWidget text="No habits yet" style={{ fontSize: 13, color: c.muted }} />
      ) : (
        shown.map((h, i) => (
          <FlexWidget key={String(i)} style={{ flexDirection: "row", alignItems: "center", flexGap: 8, width: "match_parent" }}>
            <FlexWidget
              style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: h.done ? c.done : c.track }}
            />
            <TextWidget text={h.name} style={{ fontSize: 13, color: c.text }} />
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}
