import { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// The auth flow uses a fixed blue brand look (independent of the app's light/dark theme):
// a blue screen with a centered white card.
const BLUE = "#2563eb";
const DANGER = "#dc2626";
const SUCCESS = "#16a34a";

/** Primary action button (blue on the white card) with a loading spinner + disabled state. */
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
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [styles.btn, { opacity: off ? 0.55 : pressed ? 0.9 : 1 }]}
    >
      {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>{title}</Text>}
    </Pressable>
  );
}

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/** Labeled text input on the white card. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, ...rest },
  ref,
) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor="#9ca3af"
        style={[styles.input, error ? { borderColor: DANGER } : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.errText}>{error}</Text> : null}
    </View>
  );
});

/** Auth scaffold: blue screen, centered brand + title, and a white card holding the form. */
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>THE 12 WEEK YEAR</Text>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.desc}>{description}</Text> : null}
          </View>
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <Text style={[styles.msg, { color: DANGER }]}>{children}</Text>;
}

export function InfoText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <Text style={[styles.msg, { color: SUCCESS }]}>{children}</Text>;
}

/** Inline tappable text link (blue, centered). */
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
    <Text onPress={disabled ? undefined : onPress} style={[styles.link, disabled && { color: "#9ca3af" }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BLUE },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 18 },
  header: { gap: 6, marginBottom: 8, alignItems: "center" },
  brand: { fontSize: 12, fontWeight: "700", letterSpacing: 2, color: "rgba(255,255,255,0.85)" },
  title: { fontSize: 28, fontWeight: "800", color: "#ffffff", textAlign: "center" },
  desc: { fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.9)", textAlign: "center" },
  card: { backgroundColor: "#ffffff", borderRadius: 20, padding: 20, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#0b0b0c" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 16,
    color: "#0b0b0c",
    backgroundColor: "#ffffff",
  },
  errText: { fontSize: 12, color: DANGER },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", backgroundColor: BLUE, marginTop: 4 },
  btnText: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
  msg: { fontSize: 14, textAlign: "center" },
  link: { fontSize: 14, fontWeight: "600", color: BLUE, textAlign: "center" },
});
