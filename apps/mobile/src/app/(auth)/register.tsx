import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterValues } from "@twy/core";
import { ApiException } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { AuthScreen, Button, ErrorText, LinkText, TextField } from "@/components/ui";

export default function RegisterScreen() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      // Timezone is auto-detected by the auth context. Registration sends an OTP instead of
      // logging in, so we route to the verification screen.
      await registerUser(values);
      router.replace({ pathname: "/verify-email", params: { email: values.email } });
    } catch (error) {
      setFormError(
        error instanceof ApiException ? error.message : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <AuthScreen title="Create your account" description="Start your first quarter.">
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Name"
            autoComplete="name"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.displayName?.message}
          />
        )}
      />

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
            autoComplete="new-password"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <ErrorText>{formError}</ErrorText>

      <Button title="Create account" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />

      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 8 }}>
        <LinkText onPress={() => router.replace("/login")}>Already have an account? Sign in</LinkText>
      </View>
    </AuthScreen>
  );
}
