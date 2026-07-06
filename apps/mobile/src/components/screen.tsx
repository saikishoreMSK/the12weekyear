import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Standard tab-screen scaffold: full-bleed themed background + safe top area + padded scroll. */
export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {scroll ? (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>{children}</ScrollView>
        ) : (
          <View className="flex-1 p-5">{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}
