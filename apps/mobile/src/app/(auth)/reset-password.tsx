import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ApiException, authApi } from "@/lib/api";
import { useResendCooldown } from "@/features/auth/use-resend-cooldown";
import { AuthScreen, Button, ErrorText, InfoText, LinkText, TextField } from "@/components/ui";

const RESEND_COOLDOWN_SECONDS = 120;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const initialEmail = useLocalSearchParams<{ email?: string }>().email ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cooldown = useResendCooldown();

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await authApi.resetPassword(email.trim(), code.trim(), newPassword);
      router.replace("/login");
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Couldn't reset. Try again.");
      setSubmitting(false);
    }
  }

  async function onResend() {
    setError(null);
    setInfo(null);
    try {
      await authApi.resendOtp(email.trim(), "PASSWORD_RESET");
      cooldown.start(RESEND_COOLDOWN_SECONDS);
      setInfo("A new code is on its way.");
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Couldn't resend. Try again.");
    }
  }

  return (
    <AuthScreen
      title="Set a new password"
      description="Enter the code we emailed you and a new password."
    >
      <TextField
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />

      <TextField
        label="Reset code"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, ""))}
        style={{ textAlign: "center", letterSpacing: 8, fontSize: 20 }}
      />

      <TextField
        label="New password"
        secureTextEntry
        autoComplete="new-password"
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <ErrorText>{error}</ErrorText>
      <InfoText>{info}</InfoText>

      <Button
        title="Reset password"
        loading={submitting}
        disabled={code.length < 6 || newPassword.length < 8}
        onPress={onSubmit}
      />

      <View style={{ alignItems: "center", marginTop: 8, gap: 10 }}>
        <LinkText disabled={cooldown.active} onPress={onResend}>
          {cooldown.active ? `Resend in ${cooldown.seconds}s` : "Resend code"}
        </LinkText>
        <LinkText onPress={() => router.replace("/login")}>Back to sign in</LinkText>
      </View>
    </AuthScreen>
  );
}
