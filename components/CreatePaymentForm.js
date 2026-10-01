"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { useToast } from "@/components/Toast";

export function CreatePaymentForm({ projects, fixedProjectId, defaultDescription = "50% Project Advance" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    projectId: fixedProjectId || projects?.[0]?.id || "",
    amount: "", currency: "INR", description: defaultDescription, paymentType: "advance", dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return toast(json.error || "Could not create payment request.", "error");
    toast("Payment request created. The client can see it now.", "success");
    setForm((f) => ({ ...f, amount: "" }));
    router.refresh();
  }

  return (
    <Card>
      <h3 className="font-mono-ladion text-xs text-muted mb-4">CREATE PAYMENT REQUEST</h3>
      <form onSubmit={submit} className="space-y-4">
        {!fixedProjectId && (
          <div>
            <label className="field-label">Project</label>
            <select className="field-input" value={form.projectId} onChange={set("projectId")} required>
              {(projects || []).map((p) => (
                <option key={p.id} value={p.id}>{p.project_code} &middot; {p.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="field-label">Amount</label>
            <input type="number" min="1" step="0.01" required className="field-input" value={form.amount} onChange={set("amount")} placeholder="25000" />
          </div>
          <div>
            <label className="field-label">Currency</label>
            <select className="field-input" value={form.currency} onChange={set("currency")}>
              <option>INR</option><option>USD</option><option>EUR</option>
            </select>
          </div>
        </div>
        <div>
          <label className="field-label">Payment description</label>
          <input required className="field-input" value={form.description} onChange={set("description")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Payment type</label>
            <select className="field-input" value={form.paymentType} onChange={set("paymentType")}>
              <option value="advance">Advance</option><option value="milestone">Milestone</option>
              <option value="final">Final payment</option><option value="invoice">Invoice</option>
            </select>
          </div>
          <div>
            <label className="field-label">Due date</label>
            <input type="date" className="field-input" value={form.dueDate} onChange={set("dueDate")} />
          </div>
        </div>
        <Button type="submit" variant="solid" className="w-full" disabled={loading || !form.projectId}>
          {loading ? "Creating\u2026" : "Create payment request"}
        </Button>
      </form>
    </Card>
  );
}
