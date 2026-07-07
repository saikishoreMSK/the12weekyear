import { useColorScheme } from "nativewind";

/**
 * Minimal color palette + light/dark hook. StyleSheet-based for M1; NativeWind + a fuller design
 * system arrive in M2.
 */
export interface Palette {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  inputBg: string;
}

export const light: Palette = {
  bg: "#ffffff",
  card: "#ffffff",
  text: "#0b0b0c",
  muted: "#6b7280",
  border: "#e5e7eb",
  primary: "#2563eb",
  primaryText: "#ffffff",
  danger: "#dc2626",
  success: "#16a34a",
  inputBg: "#ffffff",
};

export const dark: Palette = {
  bg: "#0b0b0c",
  card: "#161618",
  text: "#f5f5f5",
  muted: "#9ca3af",
  border: "#27272a",
  primary: "#3b82f6",
  primaryText: "#ffffff",
  danger: "#f87171",
  success: "#34d399",
  inputBg: "#161618",
};

export function useColors(): Palette {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? dark : light;
}
