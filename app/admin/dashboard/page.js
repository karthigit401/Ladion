import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/demo";

export const dynamic = "force-dynamic";

const ACTIVITY_LABELS = {
  project_submitted: "New project submitted",
  payment_requested: "Payment request created",
  payment_received: "Payment received",
  status_changed: "Project status updated",
};

export default async function AdminDashboard() {
  const supabase = createClient();

  const count = async (table, build) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (build) q = build(q);
    const { count: c } = await q;
    return c || 0;
  };

  const [clients, active, pending, completed, notifications] = await Promise.all([
    count("profiles", (q) => q.eq("role", "client")),
    count("projects", (q) => q.in("status", ["payment_received", "under_review", "in_progress", "testing"])),
    count("payments", (q) => q.in("status", ["created", "processing", "failed"])),
    count("projects", (q) => q.eq("status", "completed")),
    count("notifications"),
  ]);

  const { data: paid } = await supabase.from("payments").select("amount, currency").eq("status", "paid");
  const revenue = (paid || []).reduce((sum, p) => sum + Number(p.amount), 0);

  const { data: activity } = await supabase
    .from("activity_log").select("*, projects(name, project_code)")
    .order("created_at", { ascending: false }).limit(10);

  return (
    <div className="fade-up">
      <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">ADMIN / DASHBOARD</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Operations overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <StatCard label="TOTAL CLIENTS" value={clients} />
        <StatCard label="ACTIVE PROJECTS" value={active} />
        <StatCard label="PENDING PAYMENTS" value={pending} />
        <StatCard label="COMPLETED" value={completed} />
        <StatCard label="REVENUE (DEMO)" value={formatCurrency(revenue)} hint="Simulated payments" />
        <StatCard label="NOTIFICATIONS" value={notifications} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <Link href="/admin/projects" className="text-sm text-accent hover:text-accentStrong">All projects &rarr;</Link>
      </div>
      {(activity || []).length === 0 ? (
        <EmptyState title="NO ACTIVITY YET" description="Activity appears here as clients submit projects and payments are made." />
      ) : (
        <Card className="p-0 divide-y divide-white/5">
          {activity.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
              <div>
                <span className="font-medium">{ACTIVITY_LABELS[a.action] || a.action}</span>
                {a.projects && (
                  <Link href={`/admin/projects/${a.project_id}`} className="text-muted hover:text-fg ml-2">
                    {a.projects.name}
                  </Link>
                )}
              </div>
              <span className="text-xs text-muted font-mono-ladion shrink-0">
                {new Date(a.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
