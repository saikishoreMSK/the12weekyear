import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { Lock } from "lucide-react-native";

import { authenticate, loadLockPref } from "./lock";
import { useColors } from "@/theme";

/**
 * Optional biometric app-lock. When enabled (Profile → App lock), the app content is hidden behind
 * a biometric prompt on launch and again after returning from the background. Off by default; on web
 * it's always unlocked.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(true);
  const c = useColors();

  useEffect(() => {
    loadLockPref().then((e) => {
      setEnabled(e);
      setLocked(e);
      setChecked(true);
    });
  }, []);

  const unlock = useCallback(async () => {
    if (await authenticate()) setLocked(false);
  }, []);

  // Prompt automatically whenever we become locked while enabled.
  useEffect(() => {
    if (checked && enabled && locked) void unlock();
  }, [checked, enabled, locked, unlock]);

  // Re-lock when the app goes to the background.
  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") setLocked(true);
    });
    return () => sub.remove();
  }, [enabled]);

  if (!checked) return null;
  if (!enabled || !locked) return <>{children}</>;

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-8 dark:bg-black">
      <Lock color={c.muted} size={40} />
      <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Locked</Text>
      <Pressable onPress={unlock} className="rounded-lg bg-blue-600 px-6 py-3 active:opacity-80">
        <Text className="font-semibold text-white">Unlock</Text>
      </Pressable>
    </View>
  );
}
