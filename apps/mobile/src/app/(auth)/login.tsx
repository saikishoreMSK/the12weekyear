import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginValues } from "@twy/core";
import { ApiException } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { AuthScreen, Button, ErrorText, LinkText, TextField, WakeNotice } from "@/components/ui";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login(values);
      router.replace("/");
    } catch (error) {
      // An unverified account is sent to the OTP screen rather than shown an error.
      if (error instanceof ApiException && error.code === "EMAIL_NOT_VERIFIED") {
        router.replace({ pathname: "/verify-email", params: { email: values.email } });
        return;
      }
      setFormError(
        error instanceof ApiException ? error.message : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <AuthScreen title="Welcome back" description="Sign in to continue your quarter.">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Password"
            secureTextEntry
            autoComplete="current-password"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <ErrorText>{formError}</ErrorText>

      <Button title="Sign in" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />

      <WakeNotice active={isSubmitting} />

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 }}>
        <LinkText onPress={() => router.push("/forgot-password")}>Forgot password?</LinkText>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
        <LinkText onPress={() => router.replace("/register")}>No account? Create one</LinkText>
      </View>
    </AuthScreen>
  );
}
