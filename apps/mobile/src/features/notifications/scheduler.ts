import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import type { NotificationPrefs } from "./prefs";

// Foreground behavior: show a banner (no sound/badge) if a reminder fires while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = "reminders";
const Trigger = Notifications.SchedulableTriggerInputTypes;

/** Ask for notification permission (and set up the Android channel). Returns whether granted. */
export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  let granted = current.granted;
  if (!granted && current.canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (granted && Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return granted;
}

async function scheduleDaily(hour: number, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title: "The 12 Week Year", body, data: { type: "habits" } },
    trigger: { type: Trigger.DAILY, hour, minute: 0, channelId: CHANNEL_ID },
  });
}

/**
 * Cancel everything and re-schedule from the current prefs. `quarterEndIso` (yyyy-MM-dd) enables the
 * end-of-quarter nudge when known.
 */
export async function rescheduleAll(
  prefs: NotificationPrefs,
  quarterEndIso?: string | null,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled) return;

  if (prefs.morning) await scheduleDaily(8, "Good morning — check off your habits for today. ☀️");
  if (prefs.midday) await scheduleDaily(13, "Midday check-in: how are your habits going?");
  if (prefs.evening) await scheduleDaily(20, "Don't break your streak 🔥 — log today's habits.");

  if (prefs.weeklyReview) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Weekly review",
        body: "Reflect on your week and set up the next one.",
        data: { type: "review" },
      },
      trigger: { type: Trigger.WEEKLY, weekday: 1, hour: 18, minute: 0, channelId: CHANNEL_ID }, // 1 = Sunday
    });
  }

  if (prefs.quarterEnd && quarterEndIso) {
    const notifyAt = new Date(`${quarterEndIso}T10:00:00`);
    notifyAt.setDate(notifyAt.getDate() - 2); // ~2 days before the quarter ends
    if (notifyAt.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Quarter ending soon",
          body: "Wrap up this quarter and plan the next one.",
          data: { type: "quarter" },
        },
        trigger: { type: Trigger.DATE, date: notifyAt, channelId: CHANNEL_ID },
      });
    }
  }
}
