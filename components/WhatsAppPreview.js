export function WhatsAppPreview({ notification }) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10 max-w-sm">
      <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center text-xs font-semibold">
          LT
        </div>
        <div>
          <div className="text-sm font-medium">Ladion Technologies</div>
          <div className="text-[11px] text-emerald-300/80">
            {notification.status === "delivered" ? "\u2713\u2713 Delivered (Simulated)" : "Sent (Simulated)"}
          </div>
        </div>
      </div>
      <div
        className="p-4 space-y-2"
        style={{
          backgroundColor: "#0b141a",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none px-3 py-2 text-sm whitespace-pre-line ml-auto max-w-[85%] shadow">
          {notification.message}
          <div className="text-[10px] text-[#8ba39b] text-right mt-1">
            {new Date(notification.created_at).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            {"\u2713\u2713"}
          </div>
        </div>
      </div>
    </div>
  );
}
