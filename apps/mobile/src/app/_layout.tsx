// Configure the shared API client (base URL + secure token storage) once, before anything renders.
import "@/lib/api";
// Register the guest (local-first) backend so no-account use works offline.
import "@/lib/local-backend";
// NativeWind global stylesheet.
import "@/global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/features/auth/auth-context";
import { QueryProvider } from "@/lib/query";
import { loadThemePref } from "@/features/appearance/appearance";

// Navigation themes whose background matches ours, so screen transitions never flash white.
const NAV_LIGHT = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#ffffff", card: "#ffffff" } };
const NAV_DARK = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: "#0b0b0c", card: "#161618", border: "#27272a", text: "#f5f5f5" },
};

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Apply the saved Light/Dark/System preference on launch.
  useEffect(() => {
    loadThemePref().then(setColorScheme);
  }, [setColorScheme]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? NAV_DARK : NAV_LIGHT}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorScheme === "dark" ? "#0b0b0c" : "#ffffff" } }} />
            <StatusBar style="auto" />
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
