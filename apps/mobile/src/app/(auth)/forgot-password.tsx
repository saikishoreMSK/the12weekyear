import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { ApiException, authApi } from "@/lib/api";
import { AuthScreen, Button, ErrorText, LinkText, TextField } from "@/components/ui";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      // Always proceed (the API responds the same whether or not the email exists).
      router.replace({ pathname: "/reset-password", params: { email: email.trim() } });
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Reset your password"
      description="Enter your email and we'll send a 6-digit reset code."
    >
      <TextField
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />

      <ErrorText>{error}</ErrorText>

      <Button title="Send reset code" loading={submitting} disabled={!email} onPress={onSubmit} />

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <LinkText onPress={() => router.replace("/login")}>Back to sign in</LinkText>
      </View>
    </AuthScreen>
  );
}
