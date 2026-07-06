import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui";
import { useColors } from "@/theme";

/**
 * M1 authenticated placeholder — proves the session works end to end. The real Dashboard and the
 * bottom tab bar (Dashboard / Quarter / Week / Habits / Profile) arrive in M2.
 */
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const c = useColors();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: c.text }]}>Signed in ✓</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          {user ? `${user.displayName} · ${user.email}` : ""}
        </Text>
        <Text style={[styles.note, { color: c.muted }]}>
          The Dashboard and bottom tabs arrive in M2.
        </Text>
        <View style={styles.btn}>
          <Button title="Sign out" onPress={() => logout()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: "700" },
  sub: { fontSize: 14 },
  note: { fontSize: 13, marginTop: 4, textAlign: "center" },
  btn: { marginTop: 24, alignSelf: "stretch" },
});
