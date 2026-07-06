import * as Haptics from "expo-haptics";

/** A light tap — used when toggling a habit or goal. No-op / harmless on web. */
export function tapHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
