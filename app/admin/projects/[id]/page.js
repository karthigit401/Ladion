import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card } from "@/components/ui";
import { AdminProjectControls } from "@/components/AdminProjectControls";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import { NotificationList } from "@/components/NotificationList";
import {
  PROJECT_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatCurrency, formatDate, statusTone,
} from "@/lib/demo";

export const dynamic = "force-dynamic";

const FIELDS = [
  ["Description", "description"], ["Business problem", "business_problem"], ["Goals", "goals"],
  ["Functional requirements", "functional_requirements"], ["Technical requirements", "technical_requirements"],
  ["Target users", "target_users"], ["Preferred technology", "preferred_technology"],
  ["Expected features", "expected_features"], ["Integrations", "integrations_required"], ["Budget", "budget"],
];

const ACTIVITY_LABELS = {
  project_submitted: "Project submitted", payment_requested: "Payment requested",
  payment_received: "Payment received", status_changed: "Status changed",
};

export default async function AdminProjectDetail({ params }) {
  const supabase = createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*, services(name), profiles:client_id(*), payments(*), project_files(*)")
    .eq("id", params.id).single();
  if (!project) notFound();

  const [{ data: notifications }, { data: activity }] = await Promise.all([
    supabase.from("notifications").select("*").eq("project_id", project.id).order("created_at", { ascending: false }),
    supabase.from("activity_log").select("*").eq("project_id", project.id).order("created_at", { ascending: false }),
  ]);

  const files = await Promise.all(
    (project.project_files || []).map(async (f) => {
      const { data } = await supabase.storage.from("project-files").createSignedUrl(f.file_path, 3600);
      return { ...f, url: data?.signedUrl };
    })
  );
  const client = project.profiles;
  const payments = [...(project.payments || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="fade-up">
      <Link href="/admin/projects" className="text-sm text-muted hover:text-fg">&larr; All projects</Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-8">
        <div>
          <div className="font-mono-ladion text-xs text-accentStrong mb-1">{project.project_code}</div>
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-muted mt-1">{project.services?.name} &middot; Submitted {formatDate(project.created_at)}</p>
        </div>
        <Badge tone={statusTone(project.status)}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">CLIENT</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted">Name</div>{client.full_name || "\u2014"}</div>
              <div><div className="text-xs text-muted">Email</div>{client.email}</div>
              <div><div className="text-xs text-muted">Phone / WhatsApp</div>{client.phone || "\u2014"}</div>
              <div><div className="text-xs text-muted">Company</div>{project.company || client.company || "\u2014"}</div>
            </div>
          </Card>

          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">REQUIREMENTS</h2>
            <dl className="space-y-3 text-sm">
              {FIELDS.filter(([, k]) => project[k]).map(([label, k]) => (
                <div key={k}><dt className="text-xs text-muted mb-0.5">{label}</dt><dd className="whitespace-pre-line">{project[k]}</dd></div>
              ))}
              {(project.timeline_start || project.timeline_end) && (
                <div><dt className="text-xs text-muted mb-0.5">Timeline</dt>
                  <dd>{formatDate(project.timeline_start)} &rarr; {formatDate(project.timeline_end)}</dd></div>
              )}
            </dl>
          </Card>

          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">UPLOADED FILES</h2>
            {files.length === 0 ? <p className="text-sm text-muted">No files uploaded.</p> : (
              <ul className="space-y-2 text-sm">
                {files.map((f) => (
                  <li key={f.id} className="flex justify-between gap-3">
                    <span className="truncate">{f.file_name}</span>
                    {f.url && <a href={f.url} className="text-accent hover:text-accentStrong shrink-0">Download</a>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">PAYMENTS</h2>
            {payments.length === 0 ? <p className="text-sm text-muted">No payment requested yet.</p> : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="rounded-lg border border-white/10 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="font-medium">{p.description}</div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatCurrency(p.amount, p.currency)}</span>
                        <Badge tone={statusTone(p.status)}>{PAYMENT_STATUS_LABELS[p.status]}</Badge>
                      </div>
                    </div>
                    <div className="font-mono-ladion text-[11px] text-muted grid sm:grid-cols-2 gap-x-4 gap-y-1">
                      <span>Ref: {p.payment_code}</span><span>Provider: {p.provider}</span>
                      <span>Order: {p.order_id || "\u2014"}</span><span>Txn: {p.transaction_id || "\u2014"}</span>
                      <span>Paid: {p.paid_at ? new Date(p.paid_at).toLocaleString("en-IN") : "\u2014"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">NOTIFICATION HISTORY</h2>
            <NotificationList notifications={notifications || []} showDemoActions />
          </div>
        </div>

        <div className="space-y-6">
          <AdminProjectControls project={project} />
          <CreatePaymentForm fixedProjectId={project.id} />
          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">ACTIVITY TIMELINE</h2>
            {(activity || []).length === 0 ? <p className="text-sm text-muted">No activity yet.</p> : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm border-l-2 border-accent/30 pl-3">
                    <div>{ACTIVITY_LABELS[a.action] || a.action}
                      {a.meta?.new_status ? `: ${PROJECT_STATUS_LABELS[a.meta.new_status] || a.meta.new_status}` : ""}
                    </div>
                    <div className="text-[11px] text-muted font-mono-ladion">{new Date(a.created_at).toLocaleString("en-IN")}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
