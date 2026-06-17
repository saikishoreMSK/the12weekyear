import { RequireAuth } from "@/features/auth/components/require-auth";

export default function CyclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
