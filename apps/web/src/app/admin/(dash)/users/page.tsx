import Link from "next/link";

import { getUsers } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q ?? "";
  const users = await getUsers(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="border-input bg-background h-9 w-64 rounded-md border px-3 text-sm"
          />
          <button className="bg-secondary hover:bg-secondary/80 h-9 rounded-md px-3 text-sm">Search</button>
        </form>
      </div>

      <div className="text-muted-foreground text-sm">{users.length} user{users.length === 1 ? "" : "s"}</div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-left">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3 font-medium">Timezone</th>
              <th className="p-3 text-right font-medium">Quarters</th>
              <th className="p-3 text-right font-medium">Habits</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/40 border-t">
                <td className="p-3">
                  <Link href={`/admin/users/${u.id}`} className="font-medium hover:underline">
                    {u.displayName}
                  </Link>
                  {!u.emailVerified ? <span className="text-muted-foreground ml-2 text-xs">(unverified)</span> : null}
                </td>
                <td className="text-muted-foreground p-3">{u.email}</td>
                <td className="text-muted-foreground p-3">{fmtDate(u.createdAt)}</td>
                <td className="text-muted-foreground p-3">{u.timezone}</td>
                <td className="p-3 text-right tabular-nums">{u.quarterCount}</td>
                <td className="p-3 text-right tabular-nums">{u.habitCount}</td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground p-6 text-center">
                  No users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
