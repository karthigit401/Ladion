"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui";
import { useToast } from "@/components/Toast";

const STEPS = ["Service", "Project", "Requirements", "Budget & timeline", "Files", "Review"];
const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png", "image/jpeg", "application/zip", "text/plain",
];
const MAX_BYTES = 10 * 1024 * 1024;

const EMPTY = {
  serviceSlug: "", name: "", company: "", description: "", business_problem: "", goals: "",
  functional_requirements: "", technical_requirements: "", target_users: "",
  preferred_technology: "", expected_features: "", integrations_required: "",
  budget: "", timeline_start: "", timeline_end: "", priority: "normal",
};

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted/80 mt-1">{hint}</p>}
    </div>
  );
}

export function StartProjectForm({ services, initialService, userId, defaultCompany }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...EMPTY, serviceSlug: initialService, company: defaultCompany });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));
  const service = services.find((s) => s.slug === data.serviceSlug);

  function validateStep() {
    if (step === 0 && !data.serviceSlug) return "Please select a service.";
    if (step === 1 && !data.name.trim()) return "Project name is required.";
    if (step === 1 && !data.description.trim()) return "Please add a short project description.";
    if (step === 3 && data.timeline_start && data.timeline_end && data.timeline_end < data.timeline_start)
      return "Completion date must be after the start date.";
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) return toast(err, "error");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function addFiles(e) {
    const picked = Array.from(e.target.files || []);
    const valid = [];
    for (const f of picked) {
      if (!ALLOWED.includes(f.type)) { toast(`${f.name}: unsupported file type.`, "error"); continue; }
      if (f.size > MAX_BYTES) { toast(`${f.name}: larger than 10 MB.`, "error"); continue; }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid].slice(0, 10));
    e.target.value = "";
  }

  async function submit() {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const folder = crypto.randomUUID();
      const uploaded = [];
      for (const f of files) {
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${userId}/${folder}/${safeName}`;
        const { error } = await supabase.storage.from("project-files").upload(path, f);
        if (error) throw new Error(`Upload failed for ${f.name}: ${error.message}`);
        uploaded.push({ file_name: f.name, file_path: path, file_type: f.type, file_size: f.size });
      }
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, files: uploaded }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed.");
      setCreated(json.project);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- success screen ----------
  if (created) {
    return (
      <div className="max-w-xl mx-auto text-center pt-6">
        <div className="pop-in mx-auto mb-6 h-20 w-20 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path className="check-path" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Project Submitted Successfully</h1>
        <p className="text-muted mb-8">Your requirements have been received by the Ladion team.</p>
        <Card className="text-left p-6 space-y-3 mb-6">
          {[
            ["Project ID", created.project_code],
            ["Project name", created.name],
            ["Service", created.service_name],
            ["Submitted", new Date(created.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })],
            ["Status", "Requirements Received"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 text-sm">
              <span className="text-muted">{k}</span>
              <span className={clsx("font-medium text-right", k === "Project ID" && "font-mono-ladion text-accentStrong")}>{v}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-3 text-sm">
            <span className="text-muted">Next step: </span>Payment required to begin project processing.
          </div>
        </Card>
        <div className="flex justify-center gap-3">
          <Button as={Link} href={`/client/projects/${created.id}`} variant="solid">View project</Button>
          <Button as={Link} href="/client/dashboard">Go to dashboard</Button>
        </div>
      </div>
    );
  }

  const input = "field-input";
  return (
    <div className="max-w-3xl mx-auto fade-up">
      <div className="font-mono-ladion text-xs text-accent tracking-wide mb-2">START A PROJECT</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Tell us about your project</h1>

      <ol className="flex gap-1.5 mb-8">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div className={clsx("h-1 rounded-full transition-colors", i <= step ? "bg-accent" : "bg-white/10")} />
            <div className={clsx("mt-2 text-[11px] font-mono-ladion hidden sm:block", i === step ? "text-fg" : "text-muted")}>
              {String(i + 1).padStart(2, "0")} {label}
            </div>
          </li>
        ))}
      </ol>
      <div className="sm:hidden text-xs font-mono-ladion text-muted mb-4">
        Step {step + 1} of {STEPS.length} &middot; {STEPS[step]}
      </div>

      <Card className="p-6 md:p-8">
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">What service do you need?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <button
                  type="button" key={s.slug}
                  onClick={() => setData((d) => ({ ...d, serviceSlug: s.slug }))}
                  className={clsx(
                    "text-left rounded-lg border p-4 transition-all",
                    data.serviceSlug === s.slug ? "border-accent bg-accent/10" : "border-white/10 hover:border-white/25"
                  )}
                >
                  <div className="font-medium mb-1">{s.name}</div>
                  <div className="text-xs text-muted">{s.short_description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Project information</h2>
            <Field label="Project name *"><input className={input} value={data.name} onChange={set("name")} placeholder="AI-Powered Business Analytics Platform" /></Field>
            <Field label="Company / organization"><input className={input} value={data.company} onChange={set("company")} /></Field>
            <Field label="Short project description *"><textarea rows={3} className={input} value={data.description} onChange={set("description")} /></Field>
            <Field label="Business problem"><textarea rows={3} className={input} value={data.business_problem} onChange={set("business_problem")} /></Field>
            <Field label="Goals / objectives"><textarea rows={3} className={input} value={data.goals} onChange={set("goals")} /></Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Requirements</h2>
            <Field label="Functional requirements"><textarea rows={3} className={input} value={data.functional_requirements} onChange={set("functional_requirements")} /></Field>
            <Field label="Technical requirements"><textarea rows={3} className={input} value={data.technical_requirements} onChange={set("technical_requirements")} /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Target users"><input className={input} value={data.target_users} onChange={set("target_users")} /></Field>
              <Field label="Preferred technology"><input className={input} value={data.preferred_technology} onChange={set("preferred_technology")} /></Field>
            </div>
            <Field label="Expected features"><textarea rows={3} className={input} value={data.expected_features} onChange={set("expected_features")} /></Field>
            <Field label="Integrations required"><input className={input} value={data.integrations_required} onChange={set("integrations_required")} /></Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Budget &amp; timeline</h2>
            <Field label="Estimated budget"><input className={input} value={data.budget} onChange={set("budget")} placeholder="₹50,000" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Desired start date"><input type="date" className={input} value={data.timeline_start} onChange={set("timeline_start")} /></Field>
              <Field label="Expected completion date"><input type="date" className={input} value={data.timeline_end} onChange={set("timeline_end")} /></Field>
            </div>
            <Field label="Priority">
              <select className={input} value={data.priority} onChange={set("priority")}>
                <option value="low">Low</option><option value="normal">Normal</option>
                <option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </Field>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Project files</h2>
            <p className="text-sm text-muted mb-4">Optional. PDF, DOCX, XLSX, PNG, JPG, ZIP or TXT &middot; up to 10 MB each.</p>
            <label className="block rounded-lg border border-dashed border-accent/30 bg-accent/[0.03] p-8 text-center cursor-pointer hover:border-accent/60 transition-colors">
              <input type="file" multiple className="hidden" onChange={addFiles} />
              <span className="text-sm text-accentStrong">Click to choose files</span>
            </label>
            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm">
                    <span className="truncate">{f.name} <span className="text-muted">({(f.size / 1024).toFixed(0)} KB)</span></span>
                    <button type="button" className="text-muted hover:text-rose-300" onClick={() => setFiles(files.filter((_, j) => j !== i))}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Review your submission</h2>
            <dl className="space-y-3 text-sm">
              {[
                ["Service", service?.name, 0],
                ["Project name", data.name, 1],
                ["Company", data.company, 1],
                ["Description", data.description, 1],
                ["Business problem", data.business_problem, 1],
                ["Goals", data.goals, 1],
                ["Functional requirements", data.functional_requirements, 2],
                ["Technical requirements", data.technical_requirements, 2],
                ["Target users", data.target_users, 2],
                ["Preferred technology", data.preferred_technology, 2],
                ["Expected features", data.expected_features, 2],
                ["Integrations", data.integrations_required, 2],
                ["Budget", data.budget, 3],
                ["Timeline", [data.timeline_start, data.timeline_end].filter(Boolean).join(" \u2192 "), 3],
                ["Priority", data.priority, 3],
                ["Files", files.length ? files.map((f) => f.name).join(", ") : "None", 4],
              ].map(([k, v, editStep]) => (
                <div key={k} className="flex gap-4 border-b border-white/5 pb-2">
                  <dt className="w-40 shrink-0 text-muted">{k}</dt>
                  <dd className="flex-1 whitespace-pre-line break-words">{v || "\u2014"}</dd>
                  <button type="button" onClick={() => setStep(editStep)} className="text-xs text-accent hover:text-accentStrong">Edit</button>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>

      <div className="flex justify-between mt-6">
        <Button onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0 || submitting}>Back</Button>
        {step < STEPS.length - 1 ? (
          <Button variant="solid" onClick={next}>Continue</Button>
        ) : (
          <Button variant="solid" onClick={submit} disabled={submitting}>
            {submitting ? "Submitting\u2026" : "Submit project"}
          </Button>
        )}
      </div>
    </div>
  );
}
