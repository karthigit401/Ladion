import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState } from "@/components/ui";
import { PROJECT_STATUS_LABELS, formatDate, statusTone } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, services(name), profiles:client_id(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="fade-up">
      <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">ADMIN / PROJECTS</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Client projects</h1>
      {(projects || []).length === 0 ? (
        <EmptyState title="NO PROJECTS YET" description="Submitted client projects will appear here." />
      ) : (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-mono-ladion text-muted border-b border-white/10">
                {["ID", "Project", "Client", "Service", "Priority", "Status", "Submitted"].map((h) => (
                  <th key={h} className="px-4 py-3 font-normal whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono-ladion text-xs text-accentStrong whitespace-nowrap">{p.project_code}</td>
                  <td className="px-4 py-3"><Link href={`/admin/projects/${p.id}`} className="font-medium hover:text-accentStrong">{p.name}</Link></td>
                  <td className="px-4 py-3 text-muted">{p.profiles?.full_name || p.profiles?.email}</td>
                  <td className="px-4 py-3 text-muted">{p.services?.name}</td>
                  <td className="px-4 py-3 capitalize text-muted">{p.priority}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(p.status)}>{PROJECT_STATUS_LABELS[p.status]}</Badge></td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
