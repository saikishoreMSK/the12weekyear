"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn } from "@/components/motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-semibold tracking-tight">12WY</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-8">
        <FadeIn className="w-full max-w-sm">{children}</FadeIn>
      </main>
    </div>
  );
}
