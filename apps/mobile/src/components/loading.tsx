import { Image, StyleSheet, Text, View } from "react-native";

// Always the black logo on white (matches the native launch splash) — not theme-dependent.
const LOGO = require("../../assets/images/logo-black-512.png");

/** Branded splash / loading screen shown while the session is being restored. */
export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={styles.brand}>Quarterly</Text>
      <Text style={styles.tagline}>
        Achieve More in 12 Weeks{"\n"}Than Others Do in 12 Months
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#ffffff" },
  logo: { width: 120, height: 120, marginBottom: 20 },
  brand: { fontSize: 28, fontWeight: "800", letterSpacing: 0.5, color: "#0b0b0c" },
  tagline: { marginTop: 6, fontSize: 13, lineHeight: 19, textAlign: "center", color: "#6b7280" },
});
