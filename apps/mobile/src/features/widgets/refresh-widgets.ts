import type { WidgetSnapshot } from "./snapshot";

// No-op on web/iOS — react-native-android-widget is Android-only. Metro uses refresh-widgets.android.tsx there.
export function refreshWidgets(_snap: WidgetSnapshot): void {}
