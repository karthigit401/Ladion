import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, Badge } from "@/components/ui";
import { formatDate } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AdminClients() {
  const supabase = createClient();
  const { data: clients } = await supabase
    .from("profiles").select("*, projects(id)").eq("role", "client").order("created_at", { ascending: false });

  return (
    <div className="fade-up">
      <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">ADMIN / CLIENTS</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Registered clients</h1>
      {(clients || []).length === 0 ? (
        <EmptyState title="NO CLIENTS YET" description="Clients appear here after they register." />
      ) : (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-mono-ladion text-muted border-b border-white/10">
                {["Name", "Email", "Phone", "WhatsApp", "Projects", "Registered"].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 font-medium">{c.full_name || "\u2014"}</td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-muted">{c.phone || "\u2014"}</td>
                  <td className="px-4 py-3">{c.phone ? <Badge tone={c.whatsapp_opt_in ? "success" : "neutral"}>{c.whatsapp_opt_in ? "Opted in" : "Opted out"}</Badge> : <span className="text-muted">{"\u2014"}</span>}</td>
                  <td className="px-4 py-3 text-muted">{c.projects?.length || 0}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
