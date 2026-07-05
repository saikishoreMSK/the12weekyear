"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/features/auth/auth-context";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { ApiException } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login(values);
      router.replace("/dashboard");
    } catch (error) {
      // An unverified account is sent to the OTP screen rather than shown an error.
      if (error instanceof ApiException && error.code === "EMAIL_NOT_VERIFIED") {
        router.replace(`/verify-email?email=${encodeURIComponent(values.email)}`);
        return;
      }
      setFormError(
        error instanceof ApiException
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to continue your 12-week cycle.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-muted-foreground text-xs underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </div>

          {formError && <p className="text-destructive text-sm">{formError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          No account?{" "}
          <Link href="/register" className="text-foreground font-medium underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
