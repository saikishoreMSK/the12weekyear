import { Image, StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

import { useColors } from "@/theme";

// Black logo on light backgrounds, white logo on dark — picked by the active theme.
const LOGO_LIGHT = require("../../assets/images/logo-black.png");
const LOGO_DARK = require("../../assets/images/logo-white.png");

/** Branded splash / loading screen shown while the session is being restored. */
export function LoadingScreen() {
  const c = useColors();
  const { colorScheme } = useColorScheme();
  const logo = colorScheme === "dark" ? LOGO_DARK : LOGO_LIGHT;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.brand, { color: c.text }]}>Quarterly</Text>
      <Text style={[styles.tagline, { color: c.muted }]}>
        Achieve More in 12 Weeks{"\n"}Than Others Do in 12 Months
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { width: 104, height: 104, marginBottom: 20 },
  brand: { fontSize: 28, fontWeight: "800", letterSpacing: 0.5 },
  tagline: { marginTop: 6, fontSize: 13, lineHeight: 19, textAlign: "center" },
});
