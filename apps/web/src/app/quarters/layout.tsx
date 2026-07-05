import { RequireAuth } from "@/features/auth/components/require-auth";

export default function QuartersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
