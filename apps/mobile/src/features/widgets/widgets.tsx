// react-native-android-widget renders raw functions; opt this file out of the React Compiler.
"use no memo";

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

/** Common props: the actual widget size (dp) is passed so the root fills the frame. */
interface Base {
  colors: WidgetColors;
  width: number;
  height: number;
}

function rootStyle(c: WidgetColors, width: number, height: number, justify: "center" | "space-between") {
  return {
    height,
    width,
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: "column" as const,
    justifyContent: justify,
    flexGap: 6,
  };
}

export function QuoteWidget({ quote, colors: c, width, height }: Base & { quote: Quote }) {
  return (
    <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "center")}>
      <TextWidget text={`“${quote.text}”`} style={{ fontSize: 14, color: c.text }} />
      <TextWidget text={`— ${quote.author}`} style={{ fontSize: 11, color: c.muted }} />
    </FlexWidget>
  );
}

export function QuarterWidget({ quarter, colors: c, width, height }: Base & { quarter: WidgetSnapshot["quarter"] }) {
  if (!quarter) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "center")}>
        <TextWidget text="No quarter planned" style={{ fontSize: 14, color: c.muted }} />
      </FlexWidget>
    );
  }
  return (
    <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "space-between")}>
      <TextWidget text={`${quarter.label} ${quarter.year}`} style={{ fontSize: 13, color: c.muted }} />
      <TextWidget text={`${quarter.score}%`} style={{ fontSize: 34, fontWeight: "bold", color: c.text }} />
      <TextWidget
        text={quarter.currentDay ? `Day ${quarter.currentDay} / ${quarter.totalDays}` : "quarter score"}
        style={{ fontSize: 12, color: c.muted }}
      />
    </FlexWidget>
  );
}

export function WeekWidget({ week, colors: c, width, height }: Base & { week: WidgetSnapshot["week"] }) {
  if (!week) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "center")}>
        <TextWidget text="No quarter planned" style={{ fontSize: 14, color: c.muted }} />
      </FlexWidget>
    );
  }
  return (
    <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "space-between")}>
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

/** Interactive: tapping a habit row toggles today's completion (handled headless in the task handler). */
export function TodayHabitsWidget({ habits, colors: c, width, height }: Base & { habits: WidgetSnapshot["habits"] }) {
  const shown = habits.slice(0, 4);
  return (
    <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, shown.length ? "space-between" : "center")}>
      <TextWidget text="Today · tap to check off" style={{ fontSize: 13, fontWeight: "bold", color: c.text }} />
      {shown.length === 0 ? (
        <TextWidget text="No habits yet" style={{ fontSize: 13, color: c.muted }} />
      ) : (
        shown.map((h) => (
          <FlexWidget
            key={h.id}
            clickAction="TOGGLE_HABIT"
            clickActionData={{ habitId: h.id }}
            style={{ flexDirection: "row", alignItems: "center", flexGap: 8, width: "match_parent", paddingVertical: 2 }}
          >
            <FlexWidget style={{ height: 16, width: 16, borderRadius: 8, backgroundColor: h.done ? c.done : c.track }} />
            <TextWidget text={h.name} style={{ fontSize: 13, color: c.text }} />
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}

/** Horizontal progress bar fill (pixel widths — widget frames don't do percentages reliably). */
function ProgressBar({ pct, width, color, track }: { pct: number; width: number; color: `#${string}`; track: `#${string}` }) {
  const inner = Math.max(40, width - 28);
  return (
    <FlexWidget style={{ height: 8, width: inner, borderRadius: 4, backgroundColor: track }}>
      <FlexWidget style={{ height: 8, width: Math.round((Math.max(0, Math.min(100, pct)) / 100) * inner), borderRadius: 4, backgroundColor: color }} />
    </FlexWidget>
  );
}

/** Today's habit completion — "done / total" + a progress bar. */
export function TodayProgressWidget({ habits, colors: c, width, height }: Base & { habits: WidgetSnapshot["habits"] }) {
  const total = habits.length;
  const done = habits.filter((h) => h.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "space-between")}>
      <TextWidget text="Today" style={{ fontSize: 13, color: c.muted }} />
      {total === 0 ? (
        <TextWidget text="No habits yet" style={{ fontSize: 14, color: c.muted }} />
      ) : (
        <TextWidget text={`${done} / ${total}`} style={{ fontSize: 30, fontWeight: "bold", color: c.text }} />
      )}
      <ProgressBar pct={pct} width={width} color={c.done} track={c.track} />
    </FlexWidget>
  );
}

/** Days left in the quarter + a progress bar. */
export function QuarterCountdownWidget({ quarter, colors: c, width, height }: Base & { quarter: WidgetSnapshot["quarter"] }) {
  if (!quarter) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "center")}>
        <TextWidget text="No quarter planned" style={{ fontSize: 14, color: c.muted }} />
      </FlexWidget>
    );
  }
  const cur = quarter.currentDay ?? 0;
  const pct = quarter.totalDays ? Math.round((cur / quarter.totalDays) * 100) : 0;
  const daysLeft = quarter.currentDay ? Math.max(0, quarter.totalDays - quarter.currentDay) : quarter.totalDays;
  return (
    <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "space-between")}>
      <TextWidget text={`${quarter.label} ${quarter.year}`} style={{ fontSize: 12, color: c.muted }} />
      <TextWidget
        text={quarter.currentDay ? `${daysLeft} days left` : "Not started"}
        style={{ fontSize: 24, fontWeight: "bold", color: c.text }}
      />
      <ProgressBar pct={pct} width={width} color={c.primary} track={c.track} />
      <TextWidget
        text={quarter.currentDay ? `Day ${cur} / ${quarter.totalDays}` : `${quarter.totalDays} days`}
        style={{ fontSize: 11, color: c.muted }}
      />
    </FlexWidget>
  );
}

/** Current perfect-day streak. */
export function StreakWidget({ streak, colors: c, width, height }: Base & { streak: number }) {
  return (
    <FlexWidget clickAction="OPEN_APP" style={rootStyle(c, width, height, "center")}>
      <TextWidget text={`🔥 ${streak}`} style={{ fontSize: 38, fontWeight: "bold", color: c.text }} />
      <TextWidget text="day streak" style={{ fontSize: 12, color: c.muted }} />
    </FlexWidget>
  );
}
