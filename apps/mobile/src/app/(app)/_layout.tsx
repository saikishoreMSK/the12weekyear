import { useEffect } from "react";
import { Redirect, Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

import { useAuth } from "@/features/auth/auth-context";
import { LoadingScreen } from "@/components/loading";
import { useSyncWidgets } from "@/features/widgets/use-sync-widgets";
import { useQuickActions } from "@/features/shortcuts/use-quick-actions";
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

  useSyncWidgets(); // keep Android widgets in sync (no-op on web/iOS)
  useQuickActions(); // app-icon shortcuts (no-op on web)

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

  if (status === "loading") return <LoadingScreen />;
  if (status !== "authenticated") return <Redirect href="/login" />;

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
