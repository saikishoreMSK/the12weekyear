import { useEffect } from "react";
import * as QuickActions from "expo-quick-actions";
import { useQuickActionRouting } from "expo-quick-actions/router";

/**
 * Android app shortcuts (long-press the app icon): jump straight to Habits / This week / Dashboard.
 * expo-quick-actions ships a web no-op, so this is safe on all platforms. Must live in a sub-layout
 * (not the root layout) because it performs navigation.
 */
export function useQuickActions(): void {
  useQuickActionRouting();

  useEffect(() => {
    void QuickActions.setItems([
      { id: "habits", title: "Habits", params: { href: "/habits" } },
      { id: "week", title: "This week", params: { href: "/week" } },
      { id: "dashboard", title: "Dashboard", params: { href: "/" } },
    ]);
  }, []);
}
