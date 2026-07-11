import { Pool } from "pg";

/**
 * Server-only Postgres pool for the admin panel — reads the same Supabase database the API uses.
 * DATABASE_URL is a server env var (never NEXT_PUBLIC). Admin pages are force-dynamic so this never
 * runs at build time.
 */
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set (needed for the admin panel).");
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 3 });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
