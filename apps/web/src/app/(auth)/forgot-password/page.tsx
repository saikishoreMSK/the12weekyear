"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authApi } from "@/features/auth/api";
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      // Always proceed (the API responds the same whether or not the email exists).
      router.replace(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send a 6-digit reset code.
        </CardDescription>
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

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting || !email}>
            {submitting ? "Sending…" : "Send reset code"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          <Link href="/login" className="underline-offset-4 hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
