import { Redirect, Tabs } from "expo-router";
import { Calendar, CalendarDays, CircleCheck, Home, User } from "lucide-react-native";

import { useAuth } from "@/features/auth/auth-context";
import { LoadingScreen } from "@/components/loading";
import { useColors } from "@/theme";

/** App routes require a session; signed-out users are sent to sign in. Bottom tab bar. */
export default function AppLayout() {
  const { status } = useAuth();
  const c = useColors();

  if (status === "loading") return <LoadingScreen />;
  if (status !== "authenticated") return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
