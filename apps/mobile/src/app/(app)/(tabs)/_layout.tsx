import { Pressable } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { BarChart3, Calendar, CalendarDays, CircleCheck, Home, User } from "lucide-react-native";

import { useColors } from "@/theme";

/** Top-right button (on every tab) that opens the Profile screen (pushed on the parent Stack). */
function ProfileButton() {
  const router = useRouter();
  const c = useColors();
  return (
    <Pressable onPress={() => router.push("/profile")} className="px-4" hitSlop={8}>
      <User color={c.text} size={22} />
    </Pressable>
  );
}

/** The five bottom tabs. Detail screens live on the parent Stack (see (app)/_layout). */
export default function TabsLayout() {
  const c = useColors();

  return (
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
    </Tabs>
  );
}
