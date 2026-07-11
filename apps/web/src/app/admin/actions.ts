"use server";

import { redirect } from "next/navigation";

import { createSession, destroySession, verifyCredentials } from "@/lib/admin/auth";

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!verifyCredentials(username, password)) {
    return { error: "Invalid username or password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
