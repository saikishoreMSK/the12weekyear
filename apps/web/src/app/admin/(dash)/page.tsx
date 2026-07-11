import { getSignupSeries, getStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums">{value.toLocaleString()}</div>
      {hint ? <div className="text-muted-foreground mt-0.5 text-xs">{hint}</div> : null}
    </div>
  );
}

export default async function AdminOverview() {
  const [stats, series] = await Promise.all([getStats(), getSignupSeries()]);
  const max = Math.max(1, ...series.map((s) => s.count));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} hint={`${stats.verifiedUsers} verified`} />
        <StatCard label="Signups · 7d" value={stats.signups7d} />
        <StatCard label="Signups · 30d" value={stats.signups30d} />
        <StatCard label="Feedback" value={stats.totalFeedback} />
        <StatCard label="Quarters" value={stats.totalQuarters} />
        <StatCard label="Habits" value={stats.totalHabits} />
        <StatCard label="Completions" value={stats.totalCompletions} />
      </div>

      <div className="bg-card rounded-xl border p-5">
        <div className="text-sm font-semibold">Signups · last 30 days</div>
        {series.length === 0 ? (
          <p className="text-muted-foreground mt-3 text-sm">No signups in the last 30 days.</p>
        ) : (
          <div className="mt-4 flex h-40 items-end gap-1">
            {series.map((s) => (
              <div key={s.day} className="flex flex-1 flex-col items-center gap-1" title={`${s.day}: ${s.count}`}>
                <div
                  className="bg-primary w-full rounded-sm"
                  style={{ height: `${Math.round((s.count / max) * 100)}%`, minHeight: s.count > 0 ? 3 : 0 }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
