import { Text, View } from "react-native";

export default function QuarterScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
      <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Quarter</Text>
      <Text className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Your weekly goals for the current quarter — landing next in M2.
      </Text>
    </View>
  );
}
