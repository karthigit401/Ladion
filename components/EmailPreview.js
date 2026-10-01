import { Badge } from "@/components/ui";

export function EmailPreview({ notification }) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-[#0d1117]">
      <div className="bg-white/[0.04] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
        <span className="font-mono-ladion text-xs text-muted">EMAIL PREVIEW</span>
        <Badge tone={notification.status === "delivered" ? "success" : "accent"}>
          {notification.status === "delivered" ? "Delivered" : "Simulated"}
        </Badge>
      </div>
      <div className="p-4 space-y-1.5 text-sm">
        <div>
          <span className="text-muted">From: </span>Ladion Technologies
        </div>
        <div>
          <span className="text-muted">To: </span>
          {notification.recipient}
        </div>
        <div>
          <span className="text-muted">Subject: </span>
          {notification.subject}
        </div>
        <div className="mt-3 rounded-md bg-white/[0.03] border border-white/10 p-3 text-fg leading-relaxed whitespace-pre-line">
          {notification.message}
        </div>
      </div>
    </div>
  );
}
