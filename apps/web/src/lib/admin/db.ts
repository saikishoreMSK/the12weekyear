import { Pool } from "pg";

/**
 * Server-only Postgres pool for the admin panel — reads the same Supabase database the API uses.
 * DATABASE_URL is a server env var (never NEXT_PUBLIC). Admin pages are force-dynamic so this never
 * runs at build time.
 */
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const raw = process.env.DATABASE_URL;
    if (!raw) throw new Error("DATABASE_URL is not set (needed for the admin panel).");
    // The backend stores this as a JDBC URL (jdbc:postgresql://host:port/db) with the credentials in
    // separate DATABASE_USERNAME/PASSWORD vars. Parse it into discrete fields (not connectionString)
    // so our ssl option is actually honored — Supabase serves a chain Node doesn't trust by default.
    const url = new URL(raw.replace(/^jdbc:/, ""));
    pool = new Pool({
      host: url.hostname,
      port: url.port ? Number(url.port) : 5432,
      database: url.pathname.replace(/^\//, "") || "postgres",
      user: process.env.DATABASE_USERNAME ?? (url.username ? decodeURIComponent(url.username) : undefined),
      password: process.env.DATABASE_PASSWORD ?? (url.password ? decodeURIComponent(url.password) : undefined),
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
