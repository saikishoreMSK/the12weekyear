import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/auth-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View className="gap-5 p-5">
          <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Profile</Text>

          <View className="gap-1 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {user?.displayName}
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</Text>
            {user?.timezone ? (
              <Text className="mt-1 text-xs text-neutral-400">Timezone: {user.timezone}</Text>
            ) : null}
          </View>

          <View className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Analytics, sync status, notifications, and Go Premium arrive later in M2.
            </Text>
          </View>

          <Pressable
            onPress={() => logout()}
            className="items-center rounded-lg bg-blue-600 py-3.5 active:opacity-80"
          >
            <Text className="font-semibold text-white">Sign out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
