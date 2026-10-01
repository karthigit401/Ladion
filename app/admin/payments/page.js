import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState } from "@/components/ui";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import { PAYMENT_STATUS_LABELS, formatCurrency, formatDate, statusTone } from "@/lib/demo";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "All", statuses: null },
  { key: "pending", label: "Pending", statuses: ["created", "processing"] },
  { key: "paid", label: "Paid", statuses: ["paid"] },
  { key: "failed", label: "Failed", statuses: ["failed", "cancelled"] },
];

export default async function AdminPayments({ searchParams }) {
  const supabase = createClient();
  const active = FILTERS.find((f) => f.key === searchParams?.filter) || FILTERS[0];

  let q = supabase
    .from("payments")
    .select("*, projects(id, name, project_code), profiles:client_id(full_name, email)")
    .order("created_at", { ascending: false });
  if (active.statuses) q = q.in("status", active.statuses);
  const { data: payments } = await q;

  const { data: projects } = await supabase
    .from("projects").select("id, name, project_code").order("created_at", { ascending: false });

  return (
    <div className="fade-up">
      <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">ADMIN / PAYMENTS</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Payment center</h1>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="flex gap-2 mb-4">
            {FILTERS.map((f) => (
              <Link
                key={f.key} href={`/admin/payments?filter=${f.key}`}
                className={`btn ${active.key === f.key ? "border-accent/60 bg-accent/10" : ""}`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          {(payments || []).length === 0 ? (
            <EmptyState title="NO PAYMENTS" description="Create a payment request to get started." />
          ) : (
            <Card className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-mono-ladion text-muted border-b border-white/10">
                    {["Payment", "Project", "Client", "Amount", "Status", "Provider", "Order / Txn", "Date"].map((h) => (
                      <th key={h} className="px-4 py-3 font-normal whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] align-top">
                      <td className="px-4 py-3 font-mono-ladion text-xs text-accentStrong whitespace-nowrap">{p.payment_code}</td>
                      <td className="px-4 py-3"><Link href={`/admin/projects/${p.projects.id}`} className="hover:text-accentStrong">{p.projects.name}</Link></td>
                      <td className="px-4 py-3 text-muted">{p.profiles?.full_name || p.profiles?.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{formatCurrency(p.amount, p.currency)}</td>
                      <td className="px-4 py-3"><Badge tone={statusTone(p.status)}>{PAYMENT_STATUS_LABELS[p.status]}</Badge></td>
                      <td className="px-4 py-3 text-muted">{p.provider}</td>
                      <td className="px-4 py-3 font-mono-ladion text-[11px] text-muted">{p.order_id || "\u2014"}<br />{p.transaction_id || "\u2014"}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(p.paid_at || p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        <div>
          {(projects || []).length > 0
            ? <CreatePaymentForm projects={projects} />
            : <EmptyState title="NO PROJECTS" description="A payment request needs a submitted project." />}
        </div>
      </div>
    </div>
  );
}
