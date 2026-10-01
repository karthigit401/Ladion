import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, ok, fail } from "@/lib/api";
import { notifyStatusChanged } from "@/lib/projectEvents";

const STATUSES = [
  "requirements_received", "payment_pending", "payment_received",
  "under_review", "in_progress", "testing", "completed", "cancelled",
];

export async function POST(request, { params }) {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") return fail("Forbidden.", 403);

  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid request body.");

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects").select("*, profiles:client_id(*)").eq("id", params.id).single();
  if (!project) return fail("Project not found.", 404);

  const update = { updated_at: new Date().toISOString() };
  if (body.status) {
    if (!STATUSES.includes(body.status)) return fail("Invalid status.");
    update.status = body.status;
  }
  if (["low", "normal", "high", "urgent"].includes(body.priority)) update.priority = body.priority;
  if (typeof body.admin_notes === "string") update.admin_notes = body.admin_notes.slice(0, 4000);

  const { data: updated, error } = await admin.from("projects").update(update).eq("id", project.id).select().single();
  if (error) return fail(error.message, 500);

  if (update.status && update.status !== project.status) {
    await notifyStatusChanged(admin, {
      project: updated, client: project.profiles, newStatus: update.status, actorId: profile.id,
    });
  }
  return ok({ project: updated });
}
