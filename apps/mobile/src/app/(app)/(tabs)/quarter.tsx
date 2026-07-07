import { ActivityIndicator, Text, View } from "react-native";

import { useCurrentQuarter } from "@twy/core";
import { Screen } from "@/components/screen";
import { QuarterView } from "@/components/quarter-view";
import { useColors } from "@/theme";

export default function QuarterScreen() {
  const { data: quarter, isError: notPlanned } = useCurrentQuarter();
  const c = useColors();

  if (notPlanned) {
    return (
      <Screen>
        <View className="mt-16 items-center">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">No quarter planned yet</Text>
          <Text className="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Plan the current quarter from the Dashboard to start tracking here.
          </Text>
        </View>
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
