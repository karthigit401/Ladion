import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState } from "@/components/ui";
import { EmailPreview } from "@/components/EmailPreview";
import { WhatsAppPreview } from "@/components/WhatsAppPreview";

export const dynamic = "force-dynamic";

export default async function ClientNotificationsPage() {
  const supabase = createClient();
  const { data: notifications } = await supabase
    .from("notifications").select("*, projects(name)").order("created_at", { ascending: false });

  return (
    <div className="fade-up">
      <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">NOTIFICATIONS</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Messages sent to you</h1>
      <p className="text-muted mb-8">Email and WhatsApp updates about your projects and payments (simulated in demo mode).</p>

      {(notifications || []).length === 0 ? (
        <EmptyState title="NO NOTIFICATIONS YET" description="Updates appear here as your projects progress." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {notifications.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="text-xs text-muted font-mono-ladion mb-3">{n.projects?.name}</div>
              {n.channel === "email" ? <EmailPreview notification={n} /> : <WhatsAppPreview notification={n} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
