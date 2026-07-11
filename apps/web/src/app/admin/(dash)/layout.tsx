import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthed } from "@/lib/admin/auth";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminDashLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthed())) redirect("/admin/login");
  return (
    <div className="bg-background text-foreground flex min-h-dvh">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-r p-4">
        <div className="px-2 py-3 text-lg font-bold">
          Quarterly <span className="text-muted-foreground text-sm font-normal">admin</span>
        </div>
        <Link href="/admin" className="hover:bg-accent rounded-md px-3 py-2 text-sm">
          Overview
        </Link>
        <Link href="/admin/users" className="hover:bg-accent rounded-md px-3 py-2 text-sm">
          Users
        </Link>
        <Link href="/admin/feedback" className="hover:bg-accent rounded-md px-3 py-2 text-sm">
          Feedback
        </Link>
        <form action={logout} className="mt-auto">
          <button className="text-muted-foreground hover:bg-accent w-full rounded-md px-3 py-2 text-left text-sm">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
