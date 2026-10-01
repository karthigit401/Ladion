import Link from "next/link";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { Badge, Button, Card, EmptyState, StatCard } from "@/components/ui";
import {
  PROJECT_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatCurrency, formatDate, statusTone,
} from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, services(name), payments(*)")
    .order("created_at", { ascending: false });

  const { count: notificationCount } = await supabase
    .from("notifications").select("*", { count: "exact", head: true });

  const list = projects || [];
  const duePayments = list.flatMap((p) =>
    (p.payments || []).filter((pay) => ["created", "processing", "failed"].includes(pay.status)).map((pay) => ({ ...pay, project: p }))
  );

  return (
    <div className="fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">OVERVIEW</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome, {profile?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted mt-1">Track your project requests, payments and updates.</p>
        </div>
        <Button as={Link} href="/client/start-project" variant="solid">Start a project</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="PROJECTS" value={list.length} />
        <StatCard label="PAYMENTS DUE" value={duePayments.length} />
        <StatCard label="NOTIFICATIONS" value={notificationCount || 0} />
      </div>

      {duePayments.length > 0 && (
        <div className="mb-10 space-y-3">
          {duePayments.map((pay) => (
            <Card key={pay.id} className="flex flex-wrap items-center justify-between gap-4 border-amber-400/25 bg-amber-400/[0.05]">
              <div>
                <div className="font-mono-ladion text-xs text-amber-200 mb-1">PAYMENT REQUIRED</div>
                <div className="font-medium">{pay.description}</div>
                <div className="text-sm text-muted">{pay.project.name} &middot; {pay.payment_code}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold">{formatCurrency(pay.amount, pay.currency)}</div>
                <Button as={Link} href={`/client/payment/${pay.id}`} variant="solid">Pay now</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Your projects</h2>
      {list.length === 0 ? (
        <EmptyState
          title="NO PROJECT REQUESTS YET"
          description="Choose a service and submit your requirements to get started."
        />
      ) : (
        <div className="grid gap-4">
          {list.map((p) => {
            const latestPay = (p.payments || [])[0];
            return (
              <Link key={p.id} href={`/client/projects/${p.id}`}>
                <Card className="hover:border-accent/40 transition-colors flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="font-mono-ladion text-xs text-muted mb-1">{p.project_code}</div>
                    <div className="text-lg font-medium">{p.name}</div>
                    <div className="text-sm text-muted">{p.services?.name} &middot; Submitted {formatDate(p.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {latestPay && (
                      <Badge tone={statusTone(latestPay.status)}>{PAYMENT_STATUS_LABELS[latestPay.status]}</Badge>
                    )}
                    <Badge tone={statusTone(p.status)}>{PROJECT_STATUS_LABELS[p.status]}</Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
