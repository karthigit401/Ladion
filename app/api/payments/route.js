import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, ok, fail } from "@/lib/api";
import { getPaymentProvider } from "@/lib/payments";
import { logPaymentRequestCreated } from "@/lib/projectEvents";

export async function POST(request) {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") return fail("Forbidden.", 403);

  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid request body.");

  const amount = Number(body.amount);
  if (!body.projectId) return fail("Project is required.");
  if (!Number.isFinite(amount) || amount <= 0) return fail("Amount must be greater than zero.");
  if (!body.description?.trim()) return fail("Payment description is required.");

  const admin = createAdminClient();
  const { data: project } = await admin.from("projects").select("*").eq("id", body.projectId).single();
  if (!project) return fail("Project not found.", 404);

  const { data: code } = await admin.rpc("generate_payment_code");

  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      payment_code: code,
      project_id: project.id,
      client_id: project.client_id,
      amount,
      currency: body.currency || "INR",
      description: body.description.trim(),
      payment_type: body.paymentType || "advance",
      due_date: body.dueDate || null,
      status: "created",
      provider: getPaymentProvider().name,
    })
    .select()
    .single();
  if (error) return fail(error.message, 500);

  if (project.status === "requirements_received") {
    await admin.from("projects").update({ status: "payment_pending", updated_at: new Date().toISOString() }).eq("id", project.id);
  }

  await logPaymentRequestCreated(admin, { project, payment, actorId: profile.id });
  return ok({ payment }, 201);
}
