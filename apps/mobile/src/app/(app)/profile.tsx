import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { BarChart3, Bell, ChevronRight, RefreshCw, Sparkles } from "lucide-react-native";

import { useAuth } from "@/features/auth/auth-context";
import { Screen } from "@/components/screen";
import { useIsOnline } from "@/lib/query";
import { usePendingCount } from "@/lib/outbox";
import { useColors } from "@/theme";

type IconType = ComponentType<{ color?: string; size?: number }>;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const online = useIsOnline();
  const pending = usePendingCount();
  const syncValue = !online ? "Offline" : pending > 0 ? `${pending} pending` : "Synced";

  return (
    <Screen>
      {/* Account */}
      <View className="gap-1 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {user?.displayName}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</Text>
        {user?.timezone ? (
          <Text className="mt-1 text-xs text-neutral-400">Timezone: {user.timezone}</Text>
        ) : null}
      </View>

      {/* Settings list */}
      <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <Row icon={BarChart3} label="Analytics" first onPress={() => router.push("/analytics")} />
        <Row icon={RefreshCw} label="Sync" value={syncValue} />
        <Row icon={Bell} label="Notifications" value="Coming soon" disabled />
        <Row icon={Sparkles} label="Go Premium" value="Coming soon" disabled />
      </View>

      <Pressable
        onPress={() => logout()}
        className="items-center rounded-lg bg-blue-600 py-3.5 active:opacity-80"
      >
        <Text className="font-semibold text-white">Sign out</Text>
      </Pressable>

      <Text className="text-center text-xs text-neutral-400">The 12 Week Year · v{version}</Text>
    </Screen>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  onPress,
  disabled = false,
  first = false,
}: {
  icon: IconType;
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  first?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      className={`flex-row items-center gap-3 p-4 ${first ? "" : "border-t border-neutral-200 dark:border-neutral-800"} ${
        disabled ? "opacity-60" : "active:bg-neutral-100 dark:active:bg-neutral-900"
      }`}
    >
      <Icon color={c.muted} size={18} />
      <Text className="flex-1 text-neutral-900 dark:text-neutral-50">{label}</Text>
      {value ? <Text className="text-sm text-neutral-400">{value}</Text> : null}
      {onPress && !disabled ? <ChevronRight color={c.muted} size={16} /> : null}
    </Pressable>
  );
}
