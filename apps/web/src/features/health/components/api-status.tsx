"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { getHealth } from "../api";

type Status = "checking" | "online" | "offline";

/**
 * Verifies end-to-end connectivity to the Spring Boot API and renders the result.
 * Doubles as the working proof that the typed API client + response envelope are wired up.
 */
export function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;
    getHealth()
      .then(() => active && setStatus("online"))
      .catch(() => active && setStatus("offline"));
    return () => {
      active = false;
    };
  }, []);

  const label =
    status === "checking"
      ? "Checking API…"
      : status === "online"
        ? "API connected"
        : "API offline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm text-card-foreground"
    >
      <span
        className={cn(
          "size-2 rounded-full",
          status === "checking" && "bg-muted-foreground animate-pulse",
          status === "online" && "bg-emerald-500",
          status === "offline" && "bg-destructive",
        )}
      />
      {label}
    </motion.div>
  );
}
