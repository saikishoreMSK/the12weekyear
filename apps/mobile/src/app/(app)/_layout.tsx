import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/auth-context";
import { LoadingScreen } from "@/components/loading";
import { useSyncWidgets } from "@/features/widgets/use-sync-widgets";
import { useWidgetSnapshot } from "@/features/widgets/use-widget-snapshot";
import { useQuickActions } from "@/features/shortcuts/use-quick-actions";
import { adoptLocalData } from "@/features/sync/adopt";
import { useCloudSync } from "@/features/sync/use-cloud-sync";
import { useIsOnline } from "@/lib/query";
import { useColors } from "@/theme";

/**
 * Authenticated area. The bottom tabs live in the (tabs) group; detail screens (Profile, Share,
 * Habit, Reviews, a specific Quarter, …) are pushed on THIS Stack so they overlay the tabs and
 * Back returns to the tab you came from — not the default tab.
 */
export default function AppLayout() {
  const { status } = useAuth();
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const online = useIsOnline();

  useWidgetSnapshot(); // persist widget data for the headless task (plain module, always runs)
  useSyncWidgets(); // push live widget updates while the app is open (no-op on web/iOS)
  useQuickActions(); // app-icon shortcuts (no-op on web)
  useCloudSync(); // account-switch cache isolation + pull-down on foreground (signed-in only)

  // On sign-in, upload any guest data to the cloud once (Phase 2). Idempotent + self-guarded.
  useEffect(() => {
    if (status === "authenticated" && online) void adoptLocalData(qc);
  }, [status, online, qc]);

  // Tapping a reminder opens the relevant screen.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type as string | undefined;
      if (type === "habits") router.push("/habits");
      else if (type === "review") router.push("/week");
      else if (type === "quarter") router.push("/");
    });
    return () => sub.remove();
  }, [router]);

  // Guests use the app fully (local-first); only wait while the session is still resolving.
  if (status === "loading") return <LoadingScreen />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTitleStyle: { color: c.text },
        headerTintColor: c.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="share" options={{ title: "Share progress" }} />
      <Stack.Screen name="habit-detail" options={{ title: "Habit" }} />
      <Stack.Screen name="quarter-detail" options={{ title: "Quarter" }} />
      <Stack.Screen name="review" options={{ title: "Weekly review" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
      <Stack.Screen name="terms" options={{ title: "Terms of Service" }} />
    </Stack>
  );
}
