"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { PROJECT_STATUS_LABELS } from "@/lib/demo";

export function AdminProjectControls({ project }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(project.status);
  const [priority, setPriority] = useState(project.priority);
  const [notes, setNotes] = useState(project.admin_notes || "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const res = await fetch(`/api/projects/${project.id}/status`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, priority, admin_notes: notes }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return toast(json.error || "Update failed.", "error");
    toast(status !== project.status ? "Status updated. Client notified by email and WhatsApp (simulated)." : "Changes saved.", "success");
    router.refresh();
  }

  return (
    <Card>
      <h3 className="font-mono-ladion text-xs text-muted mb-4">MANAGE PROJECT</h3>
      <div className="space-y-4">
        <div>
          <label className="field-label">Status</label>
          <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Priority</label>
          <select className="field-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option><option value="normal">Normal</option>
            <option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="field-label">Internal notes (not visible to client)</label>
          <textarea rows={4} className="field-input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button variant="solid" className="w-full" onClick={save} disabled={loading}>
          {loading ? "Saving\u2026" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
