// Configure the shared API client (base URL + secure token storage) once, before anything renders.
import "@/lib/api";
// NativeWind global stylesheet.
import "@/global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/features/auth/auth-context";
import { QueryProvider } from "@/lib/query";
import { loadThemePref } from "@/features/appearance/appearance";

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  // Apply the saved Light/Dark/System preference on launch.
  useEffect(() => {
    loadThemePref().then(setColorScheme);
  }, [setColorScheme]);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
