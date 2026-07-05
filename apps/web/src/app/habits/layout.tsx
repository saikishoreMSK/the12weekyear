import { RequireAuth } from "@/features/auth/components/require-auth";

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
