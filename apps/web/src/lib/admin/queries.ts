import { query } from "./db";

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  signups7d: number;
  signups30d: number;
  totalQuarters: number;
  totalHabits: number;
  totalCompletions: number;
  totalFeedback: number;
}

export interface SignupPoint {
  day: string; // yyyy-mm-dd
  count: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  emailVerified: boolean;
  createdAt: string;
  quarterCount: number;
  habitCount: number;
}

export interface AdminUserDetail extends AdminUserRow {
  quarters: { id: string; year: number; quarterNumber: number; title: string | null; goalCount: number }[];
  habits: { id: string; name: string; active: boolean; startDate: string; completions: number }[];
  reviewCount: number;
}

export interface AdminFeedback {
  id: string;
  message: string;
  rating: number | null;
  createdAt: string;
  email: string | null;
  displayName: string | null;
}

const n = (v: unknown): number => Number(v ?? 0);

/** The feedback table may not exist yet (before the V4 migration is deployed) — treat as 0/empty. */
async function feedbackExists(): Promise<boolean> {
  const rows = await query<{ exists: boolean }>("select to_regclass('public.feedback') is not null as exists");
  return Boolean(rows[0]?.exists);
}

export async function getStats(): Promise<AdminStats> {
  const rows = await query<Record<string, unknown>>(`
    select
      (select count(*) from users) as total_users,
      (select count(*) from users where email_verified) as verified_users,
      (select count(*) from users where created_at >= now() - interval '7 days') as signups_7d,
      (select count(*) from users where created_at >= now() - interval '30 days') as signups_30d,
      (select count(*) from quarters) as total_quarters,
      (select count(*) from habits) as total_habits,
      (select count(*) from habit_completions) as total_completions
  `);
  const r = rows[0] ?? {};
  const totalFeedback = (await feedbackExists())
    ? n((await query<{ c: string }>("select count(*) as c from feedback"))[0]?.c)
    : 0;
  return {
    totalUsers: n(r.total_users),
    verifiedUsers: n(r.verified_users),
    signups7d: n(r.signups_7d),
    signups30d: n(r.signups_30d),
    totalQuarters: n(r.total_quarters),
    totalHabits: n(r.total_habits),
    totalCompletions: n(r.total_completions),
    totalFeedback,
  };
}

export async function getSignupSeries(): Promise<SignupPoint[]> {
  const rows = await query<{ day: string; count: string }>(`
    select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, count(*) as count
    from users
    where created_at >= now() - interval '30 days'
    group by 1 order by 1
  `);
  return rows.map((x) => ({ day: x.day, count: n(x.count) }));
}

export async function getUsers(search: string): Promise<AdminUserRow[]> {
  const rows = await query<Record<string, unknown>>(
    `
    select u.id, u.email, u.display_name, u.timezone, u.email_verified, u.created_at,
      (select count(*) from quarters q where q.user_id = u.id) as quarter_count,
      (select count(*) from habits h where h.user_id = u.id) as habit_count
    from users u
    where ($1 = '' or u.email ilike '%' || $1 || '%' or u.display_name ilike '%' || $1 || '%')
    order by u.created_at desc
    limit 200
  `,
    [search],
  );
  return rows.map((r) => ({
    id: String(r.id),
    email: String(r.email),
    displayName: String(r.display_name),
    timezone: String(r.timezone),
    emailVerified: Boolean(r.email_verified),
    createdAt: new Date(r.created_at as string).toISOString(),
    quarterCount: n(r.quarter_count),
    habitCount: n(r.habit_count),
  }));
}

export async function getUserDetail(id: string): Promise<AdminUserDetail | null> {
  const user = await singleUser(id);
  if (!user) return null;

  const quarters = (
    await query<Record<string, unknown>>(
      `select q.id, q.year, q.quarter_number, q.title,
        (select count(*) from goals g where g.quarter_id = q.id) as goal_count
       from quarters q where q.user_id = $1 order by q.year desc, q.quarter_number desc`,
      [id],
    )
  ).map((r) => ({
    id: String(r.id),
    year: n(r.year),
    quarterNumber: n(r.quarter_number),
    title: (r.title as string) ?? null,
    goalCount: n(r.goal_count),
  }));

  const habits = (
    await query<Record<string, unknown>>(
      `select h.id, h.name, h.active, h.start_date,
        (select count(*) from habit_completions c where c.habit_id = h.id) as completions
       from habits h where h.user_id = $1 order by h.created_at`,
      [id],
    )
  ).map((r) => ({
    id: String(r.id),
    name: String(r.name),
    active: Boolean(r.active),
    startDate: String(r.start_date),
    completions: n(r.completions),
  }));

  const reviewCount = n((await query<{ c: string }>("select count(*) as c from weekly_reviews where user_id = $1", [id]))[0]?.c);

  return { ...user, quarters, habits, reviewCount };
}

async function singleUser(id: string): Promise<AdminUserRow | null> {
  const rows = await query<Record<string, unknown>>(
    `select u.id, u.email, u.display_name, u.timezone, u.email_verified, u.created_at,
      (select count(*) from quarters q where q.user_id = u.id) as quarter_count,
      (select count(*) from habits h where h.user_id = u.id) as habit_count
     from users u where u.id = $1`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: String(r.id),
    email: String(r.email),
    displayName: String(r.display_name),
    timezone: String(r.timezone),
    emailVerified: Boolean(r.email_verified),
    createdAt: new Date(r.created_at as string).toISOString(),
    quarterCount: n(r.quarter_count),
    habitCount: n(r.habit_count),
  };
}

export async function getFeedback(): Promise<AdminFeedback[]> {
  if (!(await feedbackExists())) return [];
  const rows = await query<Record<string, unknown>>(`
    select f.id, f.message, f.rating, f.created_at, u.email, u.display_name
    from feedback f left join users u on u.id = f.user_id
    order by f.created_at desc limit 200
  `);
  return rows.map((r) => ({
    id: String(r.id),
    message: String(r.message),
    rating: r.rating == null ? null : n(r.rating),
    createdAt: new Date(r.created_at as string).toISOString(),
    email: (r.email as string) ?? null,
    displayName: (r.display_name as string) ?? null,
  }));
}
