"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/features/auth/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/habits", label: "Habits" },
  { href: "/analytics", label: "Analytics" },
];

/** Top bar for authenticated pages: brand, section nav, theme toggle, sign out. */
export function AppHeader() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b px-5 py-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
          12WY
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "transition-colors",
                  active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
