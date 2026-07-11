import { useEffect, useState, type ComponentType } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import Constants from "expo-constants";
import { Bell, BookOpen, Check, ChevronRight, FileText, Monitor, Moon, Pencil, RefreshCw, Share2, ShieldCheck, Sparkles, Sun, SunMoon, X } from "lucide-react-native";

import { useAuth } from "@/features/auth/auth-context";
import { retryAdoption, useAdoptState } from "@/features/sync/adopt";
import { Screen } from "@/components/screen";
import { useIsOnline } from "@/lib/query";
import { drainOutbox, usePendingCount } from "@/lib/outbox";
import { markSynced, relativeTime, useLastSynced } from "@/features/sync/status";
import { loadThemePref, saveThemePref, type ThemePref } from "@/features/appearance/appearance";
import { useColors } from "@/theme";

type IconType = ComponentType<{ color?: string; size?: number }>;
const THEME_OPTIONS: ThemePref[] = ["system", "light", "dark"];

export default function ProfileScreen() {
  const { user, logout, updateDisplayName } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const { setColorScheme } = useColorScheme();
  const c = useColors();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  const adopt = useAdoptState();
  const [editingName, setEditingName] = useState(false);
  const [draft, setDraft] = useState("");

  function startEditName() {
    setDraft(user?.displayName ?? "");
    setEditingName(true);
  }
  async function saveName() {
    const name = draft.trim();
    setEditingName(false);
    if (name) await updateDisplayName(name);
  }

  const online = useIsOnline();
  const pending = usePendingCount();
  const lastSynced = useLastSynced();
  const [syncing, setSyncing] = useState(false);

  const [theme, setTheme] = useState<ThemePref>("system");
  useEffect(() => {
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

  async function pickTheme(pref: ThemePref) {
    setTheme(pref);
    setColorScheme(pref);
    await saveThemePref(pref);
  }
  function cycleTheme() {
    const i = THEME_OPTIONS.indexOf(theme);
    void pickTheme(THEME_OPTIONS[(i + 1) % THEME_OPTIONS.length]);
  }
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <Screen>
      {/* Account — guest vs signed-in */}
      {!user ? (
        <View className="gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <View>
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Guest</Text>
            <Text className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Your data is saved on this device. Sign up to back it up and sync across devices.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/login")}
            className="items-center rounded-lg bg-blue-600 py-3 active:opacity-80"
          >
            <Text className="font-semibold text-white">Sign up / Log in</Text>
          </Pressable>
        </View>
      ) : (
      <View className="gap-1 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        {editingName ? (
          <View className="flex-row items-center gap-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              autoFocus
              maxLength={60}
              placeholder="Your name"
              placeholderTextColor={c.muted}
              returnKeyType="done"
              onSubmitEditing={saveName}
              className="flex-1 border-b border-neutral-300 pb-1 text-lg font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
            />
            <Pressable onPress={saveName} hitSlop={10} className="p-1 active:opacity-60">
              <Check color="#16a34a" size={20} />
            </Pressable>
            <Pressable onPress={() => setEditingName(false)} hitSlop={10} className="p-1 active:opacity-60">
              <X color={c.muted} size={20} />
            </Pressable>
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{user?.displayName}</Text>
            <Pressable onPress={startEditName} hitSlop={10} className="p-1 active:opacity-60">
              <Pencil color={c.muted} size={15} />
            </Pressable>
          </View>
        )}
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</Text>
        {user?.timezone ? <Text className="mt-1 text-xs text-neutral-400">Timezone: {user.timezone}</Text> : null}
      </View>
      )}

      {/* One-time local→cloud upload after sign-in */}
      {user && adopt === "importing" ? (
        <View className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3">
          <Text className="text-sm text-blue-700 dark:text-blue-300">Backing up your local data to the cloud…</Text>
        </View>
      ) : null}
      {user && adopt === "error" ? (
        <Pressable
          onPress={() => retryAdoption(qc)}
          className="flex-row items-center justify-between rounded-xl border border-red-500/40 bg-red-500/10 p-3 active:opacity-70"
        >
          <Text className="text-sm text-red-700 dark:text-red-300">Couldn&apos;t back up your local data.</Text>
          <Text className="text-sm font-semibold text-red-700 dark:text-red-300">Retry</Text>
        </Pressable>
      ) : null}

      {/* Settings (Appearance + actions) */}
      <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <Pressable
          onPress={cycleTheme}
          className="flex-row items-center gap-3 p-4 active:bg-neutral-100 dark:active:bg-neutral-900"
        >
          <SunMoon color={c.muted} size={18} />
          <Text className="flex-1 text-neutral-900 dark:text-neutral-50">Appearance</Text>
          <Text className="mr-1 text-sm capitalize text-neutral-400">{theme}</Text>
          <ThemeIcon color={c.muted} size={18} />
        </Pressable>
        <Row icon={BookOpen} label="How to use" onPress={() => router.push("/how-to-use")} />
        <Row icon={Share2} label="Share progress" onPress={() => router.push("/share")} />
        <Row icon={RefreshCw} label="Sync now" value={syncValue} onPress={syncNow} />
        <Row icon={Bell} label="Notifications" onPress={() => router.push("/notifications")} />
        <Row icon={Sparkles} label="Go Premium" value="Coming soon" disabled />
      </View>

      {/* Legal */}
      <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <Row icon={ShieldCheck} label="Privacy Policy" first onPress={() => router.push("/privacy")} />
        <Row icon={FileText} label="Terms of Service" onPress={() => router.push("/terms")} />
      </View>

      {user ? (
        <Pressable onPress={() => logout()} className="items-center rounded-lg bg-blue-600 py-3.5 active:opacity-80">
          <Text className="font-semibold text-white">Sign out</Text>
        </Pressable>
      ) : null}

      <Text className="text-center text-xs text-neutral-400">Quarterly · v{version}</Text>
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
