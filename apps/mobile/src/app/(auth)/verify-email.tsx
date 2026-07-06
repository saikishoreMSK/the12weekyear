import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ApiException, authApi } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { useResendCooldown } from "@/features/auth/use-resend-cooldown";
import { AuthScreen, Button, ErrorText, InfoText, LinkText, TextField } from "@/components/ui";

const RESEND_COOLDOWN_SECONDS = 120;

export default function VerifyEmailScreen() {
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const email = useLocalSearchParams<{ email?: string }>().email ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cooldown = useResendCooldown();

  async function onVerify() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await verifyEmail(email, code.trim());
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Couldn't verify. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    setError(null);
    setInfo(null);
    try {
      await authApi.resendOtp(email, "EMAIL_VERIFICATION");
      cooldown.start(RESEND_COOLDOWN_SECONDS);
      setInfo("A new code is on its way.");
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Couldn't resend. Try again.");
    }
  }

  return (
    <AuthScreen
      title="Verify your email"
      description={`We sent a 6-digit code to ${email || "your email"}. It expires in 5 minutes.`}
    >
      <TextField
        label="Verification code"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, ""))}
        style={{ textAlign: "center", letterSpacing: 8, fontSize: 20 }}
      />

      <ErrorText>{error}</ErrorText>
      <InfoText>{info}</InfoText>

      <Button
        title="Verify & continue"
        loading={submitting}
        disabled={code.length < 6}
        onPress={onVerify}
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
