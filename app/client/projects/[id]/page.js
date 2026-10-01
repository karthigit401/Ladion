import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, Button, Card } from "@/components/ui";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import {
  PROJECT_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatCurrency, formatDate, statusTone,
} from "@/lib/demo";

export const dynamic = "force-dynamic";

const REQUIREMENT_FIELDS = [
  ["Description", "description"], ["Business problem", "business_problem"], ["Goals", "goals"],
  ["Functional requirements", "functional_requirements"], ["Technical requirements", "technical_requirements"],
  ["Target users", "target_users"], ["Preferred technology", "preferred_technology"],
  ["Expected features", "expected_features"], ["Integrations", "integrations_required"], ["Budget", "budget"],
];

export default async function ClientProjectPage({ params }) {
  const supabase = createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*, services(name), payments(*), project_files(*)")
    .eq("id", params.id)
    .single();
  if (!project) notFound();

  const { data: notifications } = await supabase
    .from("notifications").select("*").eq("project_id", project.id).order("created_at", { ascending: false });

  const files = await Promise.all(
    (project.project_files || []).map(async (f) => {
      const { data } = await supabase.storage.from("project-files").createSignedUrl(f.file_path, 3600);
      return { ...f, url: data?.signedUrl };
    })
  );
  const payments = [...(project.payments || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="fade-up">
      <Link href="/client/dashboard" className="text-sm text-muted hover:text-fg">&larr; Dashboard</Link>
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
            <h2 className="font-mono-ladion text-xs text-muted mb-4">PAYMENTS</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-muted">No payment has been requested yet. You will be notified when one is.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((pay) => (
                  <div key={pay.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-4">
                    <div>
                      <div className="font-medium">{pay.description}</div>
                      <div className="text-xs text-muted font-mono-ladion mt-0.5">
                        {pay.payment_code}{pay.transaction_id ? ` \u00B7 ${pay.transaction_id}` : ""}
                        {pay.due_date ? ` \u00B7 Due ${formatDate(pay.due_date)}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{formatCurrency(pay.amount, pay.currency)}</span>
                      <Badge tone={statusTone(pay.status)}>{PAYMENT_STATUS_LABELS[pay.status]}</Badge>
                      {["created", "processing", "failed"].includes(pay.status) && (
                        <Button as={Link} href={`/client/payment/${pay.id}`} variant="solid">Pay now</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">REQUIREMENTS</h2>
            <dl className="space-y-3 text-sm">
              {REQUIREMENT_FIELDS.filter(([, k]) => project[k]).map(([label, k]) => (
                <div key={k}>
                  <dt className="text-muted text-xs mb-0.5">{label}</dt>
                  <dd className="whitespace-pre-line">{project[k]}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">FILES</h2>
            {files.length === 0 ? (
              <p className="text-sm text-muted">No files uploaded.</p>
            ) : (
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
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">PROJECT TIMELINE</h2>
            {project.status === "cancelled" ? (
              <p className="text-sm text-rose-300">This project has been cancelled.</p>
            ) : (
              <ProjectTimeline status={project.status === "payment_pending" ? "requirements_received" : project.status} />
            )}
          </Card>

          <Card>
            <h2 className="font-mono-ladion text-xs text-muted mb-4">MESSAGES</h2>
            {(notifications || []).length === 0 ? (
              <p className="text-sm text-muted">No messages yet.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="text-sm border-b border-white/5 pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono-ladion text-[11px] text-accentStrong uppercase">{n.channel}</span>
                      <span className="text-[11px] text-muted">{formatDate(n.created_at)}</span>
                    </div>
                    <p className="text-muted line-clamp-3 whitespace-pre-line">{n.subject ? `${n.subject}: ` : ""}{n.message}</p>
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
