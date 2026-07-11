"use client";

import { useActionState } from "react";

import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <form action={formAction} className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Quarterly admin</h1>
          <p className="text-muted-foreground text-sm">Sign in to continue.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" autoComplete="username" required autoFocus />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {state?.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
