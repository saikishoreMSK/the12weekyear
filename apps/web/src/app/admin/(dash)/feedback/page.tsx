import { getFeedback } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function stars(rating: number | null): string {
  if (!rating) return "";
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default async function AdminFeedbackPage() {
  const items = await getFeedback();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No feedback yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="bg-card rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">
                  {f.displayName ? `${f.displayName}` : "Guest"}
                  {f.email ? <span className="text-muted-foreground font-normal"> · {f.email}</span> : null}
                </div>
                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  {f.rating ? <span className="text-amber-500">{stars(f.rating)}</span> : null}
                  <span>{new Date(f.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
