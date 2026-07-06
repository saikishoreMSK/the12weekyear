import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Switch, Text, View } from "react-native";

import { useCurrentQuarter } from "@twy/core";
import { Screen } from "@/components/screen";
import { DEFAULT_PREFS, loadPrefs, savePrefs, type NotificationPrefs } from "@/features/notifications/prefs";
import { ensurePermission, rescheduleAll } from "@/features/notifications/scheduler";
import { useColors } from "@/theme";

export default function NotificationsScreen() {
  const c = useColors();
  const { data: quarter } = useCurrentQuarter();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPrefs().then((p) => {
      setPrefs(p);
      setLoaded(true);
    });
  }, []);

  async function apply(next: NotificationPrefs) {
    setPrefs(next);
    await savePrefs(next);
    await rescheduleAll(next, quarter?.endDate ?? null);
  }

  async function toggleMaster(value: boolean) {
    if (value) {
      const granted = await ensurePermission();
      if (!granted) {
        Alert.alert(
          "Notifications are off",
          "Turn on notifications for this app in your device settings to receive reminders.",
        );
        return;
      }
    }
    await apply({ ...prefs, enabled: value });
  }

  const toggle = (key: keyof NotificationPrefs) => (value: boolean) => apply({ ...prefs, [key]: value });

  if (!loaded) {
    return (
      <Screen>
        <View className="py-16">
          <ActivityIndicator color={c.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
        On-device reminders — no account or internet needed. They fire locally in your timezone.
      </Text>

      <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <ToggleRow label="Enable reminders" value={prefs.enabled} onChange={toggleMaster} first />
      </View>

      {prefs.enabled && (
        <>
          <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Daily habit reminders
          </Text>
          <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
            <ToggleRow label="Morning · 8:00 AM" value={prefs.morning} onChange={toggle("morning")} first />
            <ToggleRow label="Midday · 1:00 PM" value={prefs.midday} onChange={toggle("midday")} />
            <ToggleRow label="Evening · 8:00 PM" value={prefs.evening} onChange={toggle("evening")} />
          </View>

          <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Other</Text>
          <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
            <ToggleRow
              label="Weekly review · Sun 6:00 PM"
              value={prefs.weeklyReview}
              onChange={toggle("weeklyReview")}
              first
            />
            <ToggleRow label="End-of-quarter nudge" value={prefs.quarterEnd} onChange={toggle("quarterEnd")} />
          </View>
        </>
      )}
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  first = false,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  first?: boolean;
}) {
  const c = useColors();
  return (
    <View
      className={`flex-row items-center justify-between p-4 ${first ? "" : "border-t border-neutral-200 dark:border-neutral-800"}`}
    >
      <Text className="flex-1 text-neutral-900 dark:text-neutral-50">{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.primary, false: c.border }} />
    </View>
  );
}
