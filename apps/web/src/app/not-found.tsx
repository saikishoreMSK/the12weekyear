import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
