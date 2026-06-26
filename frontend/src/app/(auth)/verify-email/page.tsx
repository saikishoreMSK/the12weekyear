"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/features/auth/auth-context";
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

function VerifyEmailForm() {
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const email = useSearchParams().get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cooldown = useResendCooldown();

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await verifyEmail(email, code.trim());
      router.replace("/dashboard");
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to {email || "your email"}. It expires in 5 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onVerify} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
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

          {error && <p className="text-destructive text-sm">{error}</p>}
          {info && <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>}

          <Button type="submit" className="w-full" disabled={submitting || code.length < 6}>
            {submitting ? "Verifying…" : "Verify & continue"}
          </Button>
        </form>

        <div className="text-muted-foreground mt-4 text-center text-sm">
          Didn&apos;t get it?{" "}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
