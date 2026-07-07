import { useEffect } from "react";
import { Pressable } from "react-native";
import { Redirect, Tabs, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { BarChart3, Calendar, CalendarDays, ChevronLeft, CircleCheck, Home, User } from "lucide-react-native";

import { useAuth } from "@/features/auth/auth-context";
import { LoadingScreen } from "@/components/loading";
import { useSyncWidgets } from "@/features/widgets/use-sync-widgets";
import { useQuickActions } from "@/features/shortcuts/use-quick-actions";
import { LockGate } from "@/features/security/lock-gate";
import { useColors } from "@/theme";

/** Top-right button (on every tab) that opens the Profile screen. */
function ProfileButton() {
  const router = useRouter();
  const c = useColors();
  return (
    <Pressable onPress={() => router.push("/profile")} className="px-4" hitSlop={8}>
      <User color={c.text} size={22} />
    </Pressable>
  );
}

/** Back affordance for the pushed Profile screen. */
function BackButton() {
  const router = useRouter();
  const c = useColors();
  return (
    <Pressable onPress={() => router.back()} className="px-4" hitSlop={8}>
      <ChevronLeft color={c.text} size={24} />
    </Pressable>
  );
}

/** App routes require a session; signed-out users are sent to sign in. Bottom tab bar. */
export default function AppLayout() {
  const { status } = useAuth();
  const c = useColors();
  const router = useRouter();

  // Keep the Android home-screen widgets in sync with the latest data (no-op on web/iOS).
  useSyncWidgets();
  // App-icon shortcuts (long-press) → deep-link into the app (no-op on web).
  useQuickActions();

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
    <LockGate>
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: c.card },
        headerTitleStyle: { color: c.text },
        headerTintColor: c.text,
        headerShadowVisible: false,
        headerRight: () => <ProfileButton />,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="quarter"
        options={{ title: "Quarter", tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="week"
        options={{ title: "Week", tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="habits"
        options={{ title: "Habits", tabBarIcon: ({ color, size }) => <CircleCheck color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: "Analytics", tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }}
      />
      {/* Opened from the top-right button; not a bottom tab. Hides the tab bar and shows a back arrow. */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: null,
          headerRight: () => null,
          headerLeft: () => <BackButton />,
          tabBarStyle: { display: "none" },
        }}
      />
      {/* Opened from Profile → Notifications. */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          href: null,
          headerRight: () => null,
          headerLeft: () => <BackButton />,
          tabBarStyle: { display: "none" },
        }}
      />
      {/* Opened from Profile → Share progress. */}
      <Tabs.Screen
        name="share"
        options={{
          title: "Share progress",
          href: null,
          headerRight: () => null,
          headerLeft: () => <BackButton />,
          tabBarStyle: { display: "none" },
        }}
      />
      {/* Opened by tapping a habit (active or archived). */}
      <Tabs.Screen
        name="habit-detail"
        options={{
          title: "Habit",
          href: null,
          headerRight: () => null,
          headerLeft: () => <BackButton />,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
    </LockGate>
  );
}
