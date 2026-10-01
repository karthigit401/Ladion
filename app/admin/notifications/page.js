import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NotificationList } from "@/components/NotificationList";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "All" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
];

export default async function AdminNotifications({ searchParams }) {
  const supabase = createClient();
  const active = TABS.find((t) => t.key === searchParams?.channel)?.key || "all";

  let q = supabase
    .from("notifications").select("*, profiles:client_id(full_name)").order("created_at", { ascending: false });
  if (active !== "all") q = q.eq("channel", active);
  const { data: notifications } = await q;

  return (
    <div className="fade-up">
      <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">ADMIN / NOTIFICATIONS</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Notification center</h1>
      <p className="text-muted mb-6">Every email and WhatsApp message the platform has sent. Click a row to preview it.</p>
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/notifications?channel=${t.key}`}
            className={`btn ${active === t.key ? "border-accent/60 bg-accent/10" : ""}`}>{t.label}</Link>
        ))}
      </div>
      <NotificationList notifications={notifications || []} showDemoActions showClient />
    </div>
  );
}
