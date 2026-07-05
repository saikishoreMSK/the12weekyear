import { RequireAuth } from "@/features/auth/components/require-auth";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
