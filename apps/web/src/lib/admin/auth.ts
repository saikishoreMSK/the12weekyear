import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal admin auth: a username/password from env, and a signed (HMAC) session cookie. No user DB
 * involved — this gate is only for the operator.
 */
const COOKIE = "admin_session";
const TTL_SECONDS = 60 * 60 * 12; // 12 hours

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-admin-session-secret-change-me";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

/** True if the given credentials match the configured admin username/password. */
export function verifyCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  return Boolean(u && p && username === u && password === p);
}

export async function createSession(): Promise<void> {
  const expires = String(Date.now() + TTL_SECONDS * 1000);
  const value = `${expires}.${sign(expires)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // allow http on localhost in dev
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function isAuthed(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig || sign(payload) !== sig) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() < expires;
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
