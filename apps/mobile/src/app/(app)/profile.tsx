import { useEffect, useState, type ComponentType } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import Constants from "expo-constants";
import { Bell, ChevronRight, FileText, Lock, RefreshCw, Share2, ShieldCheck, Sparkles } from "lucide-react-native";

import { useAuth } from "@/features/auth/auth-context";
import { Screen } from "@/components/screen";
import { useIsOnline } from "@/lib/query";
import { drainOutbox, usePendingCount } from "@/lib/outbox";
import { markSynced, relativeTime, useLastSynced } from "@/features/sync/status";
import { isBiometricAvailable, loadLockPref, saveLockPref } from "@/features/security/lock";
import { loadThemePref, saveThemePref, type ThemePref } from "@/features/appearance/appearance";
import { useColors } from "@/theme";

type IconType = ComponentType<{ color?: string; size?: number }>;
const THEME_OPTIONS: ThemePref[] = ["system", "light", "dark"];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const c = useColors();
  const qc = useQueryClient();
  const { setColorScheme } = useColorScheme();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  const online = useIsOnline();
  const pending = usePendingCount();
  const lastSynced = useLastSynced();
  const [syncing, setSyncing] = useState(false);

  const [appLock, setAppLock] = useState(false);
  const [theme, setTheme] = useState<ThemePref>("system");
  useEffect(() => {
    loadLockPref().then(setAppLock);
    loadThemePref().then(setTheme);
  }, []);

  const syncValue = !online
    ? "Offline"
    : syncing
      ? "Syncing…"
      : pending > 0
        ? `${pending} pending`
        : `Synced · ${relativeTime(lastSynced)}`;

  async function syncNow() {
    if (!online || syncing) return;
    setSyncing(true);
    try {
      await qc.invalidateQueries();
      await drainOutbox();
      markSynced();
    } finally {
      setSyncing(false);
    }
  }

  async function toggleLock(value: boolean) {
    if (value && !(await isBiometricAvailable())) {
      Alert.alert("Not available", "Set up a fingerprint or face unlock on your device first.");
      return;
    }
    setAppLock(value);
    await saveLockPref(value);
  }

  async function pickTheme(pref: ThemePref) {
    setTheme(pref);
    setColorScheme(pref);
    await saveThemePref(pref);
  }

  return (
    <Screen>
      {/* Account */}
      <View className="gap-1 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{user?.displayName}</Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</Text>
        {user?.timezone ? <Text className="mt-1 text-xs text-neutral-400">Timezone: {user.timezone}</Text> : null}
      </View>

      {/* Appearance */}
      <View className="gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Appearance</Text>
        <View className="flex-row gap-2">
          {THEME_OPTIONS.map((opt) => {
            const on = theme === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => pickTheme(opt)}
                className={`flex-1 items-center rounded-lg border py-2 ${on ? "border-blue-600 bg-blue-600" : "border-neutral-300 dark:border-neutral-700"}`}
              >
                <Text className={`text-sm capitalize ${on ? "text-white" : "text-neutral-700 dark:text-neutral-300"}`}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Settings */}
      <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <Row icon={Share2} label="Share progress" first onPress={() => router.push("/share")} />
        <Row icon={RefreshCw} label="Sync now" value={syncValue} onPress={syncNow} />
        <Row icon={Bell} label="Notifications" onPress={() => router.push("/notifications")} />
        <Row icon={Sparkles} label="Go Premium" value="Coming soon" disabled />
      </View>

      {/* Legal */}
      <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <Row icon={ShieldCheck} label="Privacy Policy" first onPress={() => router.push("/privacy")} />
        <Row icon={FileText} label="Terms of Service" onPress={() => router.push("/terms")} />
      </View>

      {/* Security */}
      <View className="rounded-xl border border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center gap-3 p-4">
          <Lock color={c.muted} size={18} />
          <View className="flex-1">
            <Text className="text-neutral-900 dark:text-neutral-50">App lock</Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              Require fingerprint / face to open the app
            </Text>
          </View>
          <Switch value={appLock} onValueChange={toggleLock} trackColor={{ true: c.primary, false: c.border }} />
        </View>
      </View>

      <Pressable onPress={() => logout()} className="items-center rounded-lg bg-blue-600 py-3.5 active:opacity-80">
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
