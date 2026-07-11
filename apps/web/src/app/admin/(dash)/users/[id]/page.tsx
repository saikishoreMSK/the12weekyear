import Link from "next/link";
import { notFound } from "next/navigation";

import { getUserDetail } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function quarterLabel(q: number): string {
  const m = (q - 1) * 3 + 1;
  return `${MONTHS[m]}–${MONTHS[m + 2]}`;
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/users" className="text-muted-foreground text-sm hover:underline">
          ← Users
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{user.displayName}</h1>
        <p className="text-muted-foreground text-sm">
          {user.email} · {user.timezone} · joined {new Date(user.createdAt).toLocaleDateString()}
          {user.emailVerified ? "" : " · unverified"}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Quarters ({user.quarters.length})</h2>
        {user.quarters.length === 0 ? (
          <p className="text-muted-foreground text-sm">No quarters.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-left">
                <tr>
                  <th className="p-3 font-medium">Quarter</th>
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 text-right font-medium">Goals</th>
                </tr>
              </thead>
              <tbody>
                {user.quarters.map((q) => (
                  <tr key={q.id} className="border-t">
                    <td className="p-3">
                      Q{q.quarterNumber} {quarterLabel(q.quarterNumber)} {q.year}
                    </td>
                    <td className="text-muted-foreground p-3">{q.title ?? "—"}</td>
                    <td className="p-3 text-right tabular-nums">{q.goalCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Habits ({user.habits.length})</h2>
        {user.habits.length === 0 ? (
          <p className="text-muted-foreground text-sm">No habits.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-left">
                <tr>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Since</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 text-right font-medium">Completions</th>
                </tr>
              </thead>
              <tbody>
                {user.habits.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="p-3 font-medium">{h.name}</td>
                    <td className="text-muted-foreground p-3">{h.startDate}</td>
                    <td className="text-muted-foreground p-3">{h.active ? "active" : "archived"}</td>
                    <td className="p-3 text-right tabular-nums">{h.completions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-muted-foreground text-sm">Weekly reviews written: {user.reviewCount}</p>
    </div>
  );
}
