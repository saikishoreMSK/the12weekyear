import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";

/**
 * Standard tab-screen scaffold: full-bleed themed background + padded scroll.
 * The native tab header provides the top inset and the tab bar the bottom, so no SafeAreaView here.
 */
export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      {scroll ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>{children}</ScrollView>
      ) : (
        <View className="flex-1 p-5">{children}</View>
      )}
    </View>
  );
}
