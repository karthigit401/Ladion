import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, ok, fail } from "@/lib/api";
import { getPaymentProvider } from "@/lib/payments";
import { signPayload } from "@/lib/payments/signature";
import { processPaymentWebhookEvent } from "@/lib/payments/webhookHandler";
import { isDemoMode } from "@/lib/demo";

/**
 * The browser only ASKS to pay. This route (server-side):
 *  1. verifies the signed-in user owns the payment,
 *  2. moves it to "processing",
 *  3. runs the provider (dummy) to create an order and charge,
 *  4. delivers the provider's result as a SIGNED webhook to /api/payments/webhook,
 *     which is the only code path allowed to mark a payment "paid".
 */
export async function POST(request, { params }) {
  const profile = await getSessionProfile();
  if (!profile) return fail("Please sign in.", 401);

  const body = await request.json().catch(() => ({}));
  const admin = createAdminClient();

  const { data: payment } = await admin.from("payments").select("*").eq("id", params.id).single();
  if (!payment || payment.client_id !== profile.id) return fail("Payment not found.", 404);
  if (payment.status === "paid") return fail("This payment has already been completed.", 409);
  if (payment.status === "cancelled") return fail("This payment request was cancelled.", 409);

  const method = ["upi", "card", "netbanking"].includes(body.method) ? body.method : "upi";
  // Failure can only be forced in demo mode.
  const forceOutcome = isDemoMode() && body.simulateFailure ? "failure" : undefined;

  await admin.from("payments").update({ status: "processing", method }).eq("id", payment.id);

  const provider = getPaymentProvider();
  const { orderId } = await provider.createOrder({ payment });
  const result = await provider.charge({ payment, orderId, method, forceOutcome });

  const event = {
    paymentId: payment.id,
    outcome: result.outcome,
    orderId,
    paymentRef: result.paymentRef,
    transactionId: result.transactionId,
    method,
    reason: result.reason,
  };

  // Deliver as a signed webhook. Fall back to a direct call if the self-request fails.
  const rawBody = JSON.stringify(event);
  try {
    const res = await fetch(new URL("/api/payments/webhook", request.url), {
      method: "POST",
      headers: { "content-type": "application/json", "x-ladion-signature": signPayload(rawBody) },
      body: rawBody,
    });
    if (!res.ok) throw new Error(`webhook responded ${res.status}`);
  } catch (err) {
    console.warn("Webhook self-call failed, processing directly:", err.message);
    await processPaymentWebhookEvent(event);
  }

  const { data: updated } = await admin.from("payments").select("*").eq("id", payment.id).single();
  return ok({ payment: updated, outcome: updated.status });
}
