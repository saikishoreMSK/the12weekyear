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

import { useColors } from "@/theme";

/** Primary action button with a loading spinner and disabled state. */
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
  const c = useColors();
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: c.primary, opacity: off ? 0.55 : pressed ? 0.9 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.primaryText} />
      ) : (
        <Text style={[styles.btnText, { color: c.primaryText }]}>{title}</Text>
      )}
    </Pressable>
  );
}

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/** Labeled text input with an error line; usable directly or via react-hook-form's Controller. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, ...rest },
  ref,
) {
  const c = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={c.muted}
        style={[
          styles.input,
          { borderColor: error ? c.danger : c.border, color: c.text, backgroundColor: c.inputBg },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.errText, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
});

/** Screen scaffold for the auth flow: safe area, keyboard avoidance, brand + title + description. */
export function AuthScreen({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const c = useColors();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.brand, { color: c.muted }]}>The 12 Week Year</Text>
            <Text style={[styles.title, { color: c.text }]}>{title}</Text>
            {description ? <Text style={[styles.desc, { color: c.muted }]}>{description}</Text> : null}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  const c = useColors();
  if (!children) return null;
  return <Text style={[styles.msg, { color: c.danger }]}>{children}</Text>;
}

export function InfoText({ children }: { children?: ReactNode }) {
  const c = useColors();
  if (!children) return null;
  return <Text style={[styles.msg, { color: c.success }]}>{children}</Text>;
}

/** Inline tappable text link. */
export function LinkText({
  children,
  onPress,
  disabled = false,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const c = useColors();
  return (
    <Text
      onPress={disabled ? undefined : onPress}
      style={[styles.link, { color: disabled ? c.muted : c.primary }]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 18 },
  header: { gap: 4, marginBottom: 12 },
  brand: { fontSize: 13, fontWeight: "600" },
  title: { fontSize: 30, fontWeight: "800" },
  desc: { fontSize: 14, lineHeight: 20 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  errText: { fontSize: 12 },
  btn: { borderRadius: 12, paddingVertical: 17, alignItems: "center", justifyContent: "center", marginTop: 4 },
  btnText: { fontSize: 17, fontWeight: "700" },
  msg: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: "600" },
});
