import { RequireAuth } from "@/features/auth/components/require-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
