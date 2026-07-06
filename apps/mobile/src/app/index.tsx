import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiClient, ApiException } from "@/lib/api";
import { env } from "@/lib/env";

type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; detail: string }
  | { kind: "error"; detail: string };

/**
 * M0 connectivity check: proves the mobile app can reach the Spring Boot API through the shared
 * @twy/core client. Replaced by the real Dashboard once M1/M2 land.
 */
export default function HealthScreen() {
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    apiClient
      .get<Record<string, unknown>>("/api/v1/health")
      .then((data) => {
        if (alive) setState({ kind: "ok", detail: JSON.stringify(data) });
      })
      .catch((err: unknown) => {
        if (!alive) return;
        const detail =
          err instanceof ApiException
            ? `${err.code} (${err.status}): ${err.message}`
            : err instanceof Error
              ? err.message
              : String(err);
        setState({ kind: "error", detail });
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>The 12 Week Year</Text>
        <Text style={styles.subtitle}>Mobile · M0 connectivity check</Text>
        <Text style={styles.api}>{env.apiBaseUrl}</Text>

        {state.kind === "loading" && <ActivityIndicator style={styles.gap} />}

        {state.kind === "ok" && (
          <>
            <Text style={[styles.badge, styles.ok]}>API reachable ✓</Text>
            <Text style={styles.detail}>{state.detail}</Text>
          </>
        )}

        {state.kind === "error" && (
          <>
            <Text style={[styles.badge, styles.err]}>API unreachable ✗</Text>
            <Text style={styles.detail}>{state.detail}</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14, opacity: 0.6 },
  api: { fontSize: 12, opacity: 0.5, marginTop: 4 },
  gap: { marginTop: 16 },
  badge: {
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "600",
    color: "#fff",
  },
  ok: { backgroundColor: "#16a34a" },
  err: { backgroundColor: "#dc2626" },
  detail: { fontSize: 12, opacity: 0.6, marginTop: 12, textAlign: "center" },
});
