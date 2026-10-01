"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, EmptyState } from "@/components/ui";
import { EmailPreview } from "@/components/EmailPreview";
import { WhatsAppPreview } from "@/components/WhatsAppPreview";
import { useToast } from "@/components/Toast";

const TONES = { simulated: "warning", delivered: "success", failed: "danger" };
const LABELS = { simulated: "Simulated", delivered: "Delivered", failed: "Failed" };

export function NotificationList({ notifications, showDemoActions = false, showClient = false }) {
  const router = useRouter();
  const { toast } = useToast();
  const [openId, setOpenId] = useState(null);

  async function markDelivered(id) {
    const res = await fetch("/api/demo/simulate", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "notification_delivered", notificationId: id }),
    });
    if (!res.ok) return toast("Could not update delivery status.", "error");
    toast("Marked as delivered (simulated).", "success");
    router.refresh();
  }

  if (!notifications.length) {
    return <EmptyState title="NO NOTIFICATIONS" description="Simulated emails and WhatsApp messages will be listed here." />;
  }

  return (
    <div className="rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
      {notifications.map((n) => (
        <div key={n.id}>
          <button
            type="button" onClick={() => setOpenId(openId === n.id ? null : n.id)}
            className="w-full text-left px-4 py-3.5 hover:bg-white/[0.03] transition-colors flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            <span className="font-mono-ladion text-[11px] uppercase w-16 text-accentStrong">{n.channel}</span>
            <span className="flex-1 min-w-[180px] text-sm truncate">
              {n.subject || n.message.split("\n")[0]}
              <span className="text-muted"> &middot; {n.recipient}</span>
              {showClient && n.profiles && <span className="text-muted"> &middot; {n.profiles.full_name}</span>}
            </span>
            <span className="text-xs text-muted font-mono-ladion">
              {new Date(n.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
            <Badge tone={TONES[n.status]}>{LABELS[n.status]}</Badge>
          </button>
          {openId === n.id && (
            <div className="px-4 pb-4 pt-1 bg-white/[0.015]">
              {n.channel === "email" ? <EmailPreview notification={n} /> : <WhatsAppPreview notification={n} />}
              {showDemoActions && n.status === "simulated" && (
                <button type="button" onClick={() => markDelivered(n.id)} className="mt-3 text-xs text-accent hover:text-accentStrong">
                  Mark as delivered (demo)
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
