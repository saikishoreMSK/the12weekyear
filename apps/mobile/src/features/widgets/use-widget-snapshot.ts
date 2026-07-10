import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useCurrentQuarter, useHabits } from "@twy/core";
import { buildWidgetSnapshot, saveWidgetSnapshot } from "./snapshot";

/**
 * Persists the widget snapshot whenever the quarter/habits data changes. Deliberately a PLAIN module
 * — it does NOT import react-native-android-widget and needs no React-Compiler opt-out — so the
 * write path (the only thing the headless widget task depends on) can't be affected by the native
 * widget library. Runs on every platform but only matters on Android; harmless elsewhere.
 */
export function useWidgetSnapshot(): void {
  const { data: quarter } = useCurrentQuarter();
  const { data: habits } = useHabits();

  useEffect(() => {
    // Heartbeat proves this effect ran (visible in the widget's diagnostic if the snapshot is ever missing).
    void AsyncStorage.setItem("twy.widgetHeartbeat", "1");
    void saveWidgetSnapshot(buildWidgetSnapshot(quarter, habits));
  }, [quarter, habits]);
}
