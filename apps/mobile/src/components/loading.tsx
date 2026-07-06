import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useColors } from "@/theme";

/** Full-screen centered spinner, used while the session is being restored. */
export function LoadingScreen() {
  const c = useColors();
  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
