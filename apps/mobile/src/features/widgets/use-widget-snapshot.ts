import { useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useCurrentQuarter, useHabits } from "@twy/core";
import { buildWidgetSnapshot, saveWidgetSnapshot } from "./snapshot";
import { refreshWidgets } from "./refresh-widgets";

/**
 * Persists the widget snapshot AND pushes a live update to placed widgets whenever the quarter/habits
 * data changes (and on foreground). Deliberately a PLAIN module — it imports no native code directly
 * (the native push lives behind the platform-split refresh-widgets) and needs no React-Compiler
 * opt-out, so both the write and the push run reliably (the old native hook's effect did not).
 */
export function useWidgetSnapshot(): void {
  const { data: quarter } = useCurrentQuarter();
  const { data: habits } = useHabits();

  useEffect(() => {
    const snap = buildWidgetSnapshot(quarter, habits);
    void AsyncStorage.setItem("twy.widgetHeartbeat", "1");
    void saveWidgetSnapshot(snap);
    refreshWidgets(snap); // live push (Android; no-op on web)

    // Re-push on foreground so a widget added while the app was open still receives data.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshWidgets(snap);
    });
    return () => sub.remove();
  }, [quarter, habits]);
}
