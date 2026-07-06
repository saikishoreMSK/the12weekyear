import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth-context";
import { LoadingScreen } from "@/components/loading";

/** Auth routes are only for signed-out users; signed-in users bounce to the app. */
export default function AuthLayout() {
  const { status } = useAuth();

  if (status === "loading") return <LoadingScreen />;
  if (status === "authenticated") return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
