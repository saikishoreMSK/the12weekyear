import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { useQuarter } from "@twy/core";
import { Screen } from "@/components/screen";
import { QuarterView } from "@/components/quarter-view";
import { useColors } from "@/theme";

/** A specific quarter opened from the Dashboard (by id), vs. the Quarter tab which shows "today's". */
export default function QuarterDetailScreen() {
  const id = useLocalSearchParams<{ id?: string }>().id ?? "";
  const { data: quarter, isError } = useQuarter(id);
  const c = useColors();

  if (isError) {
    return (
      <Screen>
        <Text className="text-neutral-500 dark:text-neutral-400">Quarter not found.</Text>
      </Screen>
    );
  }
  if (!quarter) {
    return (
      <Screen>
        <View className="py-16">
          <ActivityIndicator color={c.primary} />
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <QuarterView quarter={quarter} />
    </Screen>
  );
}
