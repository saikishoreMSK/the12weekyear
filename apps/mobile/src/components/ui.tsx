import { forwardRef, useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/theme";

// The auth flow follows the app's light/dark theme (white ⇄ near-black), not a fixed brand color.
// The primary button is high-contrast: black-on-white in light mode, white-on-black in dark mode.

/** Primary action button (high-contrast) with a loading spinner + disabled state. */
export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const off = disabled || loading;
  const spinner = colorScheme === "dark" ? "#0b0b0c" : "#ffffff";
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={{ opacity: off ? 0.5 : 1 }}
      className="mt-1 items-center justify-center rounded-xl bg-neutral-900 py-4 active:opacity-90 dark:bg-white"
    >
      {loading ? (
        <ActivityIndicator color={spinner} />
      ) : (
        <Text className="text-[17px] font-bold text-white dark:text-neutral-900">{title}</Text>
      )}
    </Pressable>
  );
}

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/** Labeled text input on the card. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, ...rest },
  ref,
) {
  const c = useColors();
  return (
    <View className="gap-1.5">
      <Text className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={c.muted}
        className={`rounded-lg border px-3 py-3 text-base text-neutral-900 dark:text-neutral-50 ${
          error ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"
        }`}
        style={style}
        {...rest}
      />
      {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
    </View>
  );
});

/** Auth scaffold: themed screen, centered brand + title, and a card holding the form. */
export function AuthScreen({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, gap: 18 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-2 items-center gap-1.5">
            <Text className="text-xs font-bold tracking-[2px] text-neutral-400 dark:text-neutral-500">
              THE 12 WEEK YEAR
            </Text>
            <Text className="text-center text-[28px] font-extrabold text-neutral-900 dark:text-neutral-50">
              {title}
            </Text>
            {description ? (
              <Text className="text-center text-sm leading-5 text-neutral-500 dark:text-neutral-400">
                {description}
              </Text>
            ) : null}
          </View>
          <View className="gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * A reassuring, escalating notice shown while an auth request is in flight. The API runs on a
 * free tier that sleeps when idle, so the first request can take ~30–60s to wake it — this tells
 * the user what's happening instead of an anonymous spinner.
 */
export function WakeNotice({ active }: { active: boolean }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active || seconds < 4) return null;
  const message =
    seconds < 12
      ? "Waking up the server…"
      : seconds < 30
        ? "The server was asleep and is starting up — this can take up to a minute."
        : seconds < 60
          ? "Almost there… free servers can take ~60s to wake. Thanks for hanging on."
          : "Taking a little longer than usual — it's still starting, please wait.";

  return <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">{message}</Text>;
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <Text className="text-center text-sm text-red-500">{children}</Text>;
}

export function InfoText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <Text className="text-center text-sm text-emerald-600 dark:text-emerald-400">{children}</Text>;
}

/** Inline tappable text link (foreground color, underlined so it reads as tappable). */
export function LinkText({
  children,
  onPress,
  disabled = false,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Text
      onPress={disabled ? undefined : onPress}
      className={`text-center text-sm font-semibold underline ${
        disabled ? "text-neutral-400 dark:text-neutral-600" : "text-neutral-900 dark:text-neutral-50"
      }`}
    >
      {children}
    </Text>
  );
}
