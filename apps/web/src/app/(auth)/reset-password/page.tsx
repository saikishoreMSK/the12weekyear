"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authApi } from "@/features/auth/api";
import { useResendCooldown } from "@/features/auth/use-resend-cooldown";
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

const RESEND_COOLDOWN_SECONDS = 120;

function ResetPasswordForm() {
  const router = useRouter();
  const initialEmail = useSearchParams().get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cooldown = useResendCooldown();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set a new password</CardTitle>
        <CardDescription>Enter the code we emailed you and a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Reset code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-lg tracking-[0.5em]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {info && <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || code.length < 6 || newPassword.length < 8}
          >
            {submitting ? "Resetting…" : "Reset password"}
          </Button>
        </form>

        <div className="text-muted-foreground mt-4 text-center text-sm">
          <button
            type="button"
            onClick={onResend}
            disabled={cooldown.active}
            className="text-foreground font-medium underline-offset-4 hover:underline disabled:no-underline disabled:opacity-60"
          >
            {cooldown.active ? `Resend in ${cooldown.seconds}s` : "Resend code"}
          </button>
        </div>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          <Link href="/login" className="underline-offset-4 hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
