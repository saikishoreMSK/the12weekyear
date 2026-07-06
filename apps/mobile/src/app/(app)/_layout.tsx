import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth-context";
import { LoadingScreen } from "@/components/loading";

/** App routes require a session; signed-out users are sent to sign in. */
export default function AppLayout() {
  const { status } = useAuth();

  if (status === "loading") return <LoadingScreen />;
  if (status !== "authenticated") return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
