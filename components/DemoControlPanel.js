"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { formatCurrency } from "@/lib/demo";

export function DemoControlPanel({ payments, simulatedCount }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);

  async function run(action, extra = {}, key) {
    setBusy(key);
    const res = await fetch("/api/demo/simulate", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...extra }),
    });
    const json = await res.json();
    setBusy(null);
    if (!res.ok) return toast(json.error || "Simulation failed.", "error");
    toast(`Done: ${json.result}`, "success");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1">Open payments</h2>
        <p className="text-sm text-muted mb-4">Force an outcome for a payment that has not been settled. Runs through the same signed webhook pipeline as a real provider.</p>
        {payments.length === 0 ? (
          <EmptyState title="NO OPEN PAYMENTS" description="Create a payment request first, then simulate its outcome here." />
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{p.projects?.name}</div>
                  <div className="text-xs font-mono-ladion text-muted">{p.payment_code} &middot; {formatCurrency(p.amount, p.currency)}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="warning">{p.status}</Badge>
                  <Button variant="solid" disabled={!!busy} onClick={() => run("payment_success", { paymentId: p.id }, p.id + "s")}>
                    {busy === p.id + "s" ? "\u2026" : "Payment success"}
                  </Button>
                  <Button disabled={!!busy} onClick={() => run("payment_failure", { paymentId: p.id }, p.id + "f")}>
                    {busy === p.id + "f" ? "\u2026" : "Payment failure"}
                  </Button>
                  <Button disabled={!!busy} onClick={() => run("payment_cancel", { paymentId: p.id }, p.id + "c")}>
                    {busy === p.id + "c" ? "\u2026" : "Cancel payment"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-1">Notification delivery</h2>
        <p className="text-sm text-muted mb-4">{simulatedCount} notification(s) currently show as &ldquo;Simulated&rdquo;.</p>
        <Button disabled={!!busy || simulatedCount === 0} onClick={() => run("all_delivered", {}, "all")}>
          {busy === "all" ? "\u2026" : "Mark email + WhatsApp as delivered"}
        </Button>
      </div>
    </div>
  );
}
