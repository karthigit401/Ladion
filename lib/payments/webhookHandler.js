import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyPaymentReceived } from "@/lib/projectEvents";

/**
 * processPaymentWebhookEvent — the single place that turns a "the provider
 * says this payment succeeded/failed" event into a database update.
 *
 * In demo mode, lib/payments/dummy.js resolves a charge synchronously and
 * this function is called directly from app/api/payments/[id]/pay/route.js
 * — no network hop, since there's no real external provider to call us
 * back.
 *
 * With a real provider wired up (see lib/payments/razorpay.js), this exact
 * function is what app/api/payments/webhook/route.js would call after
 * verifying the provider's webhook signature — the incoming request would
 * carry the same shape of event, and nothing here would need to change.
 *
 * This is intentionally the ONLY function that ever sets payment.status to
 * 'paid'. Nothing in the client-facing code path is trusted to do that.
 */
export async function processPaymentWebhookEvent(event) {
  const admin = createAdminClient();
  const { paymentId, outcome, orderId, paymentRef, transactionId, method, reason } = event;

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("*, projects(*), profiles:client_id(*)")
    .eq("id", paymentId)
    .single();

  if (paymentError || !payment) {
    throw new Error(`Webhook received for unknown payment ${paymentId}`);
  }

  // Idempotency: if this payment was already settled, don't process twice.
  if (payment.status === "paid" || payment.status === "failed" || payment.status === "cancelled") {
    return { alreadyProcessed: true, payment };
  }

  if (outcome === "cancelled") {
    const { data: updated } = await admin
      .from("payments")
      .update({ status: "cancelled" })
      .eq("id", paymentId)
      .select()
      .single();
    return { payment: updated, outcome: "cancelled" };
  }

  if (outcome === "failure") {
    const { data: updated } = await admin
      .from("payments")
      .update({ status: "failed", order_id: orderId, method })
      .eq("id", paymentId)
      .select()
      .single();

    return { payment: updated, outcome: "failure", reason };
  }

  const { data: updatedPayment, error: updateError } = await admin
    .from("payments")
    .update({
      status: "paid",
      order_id: orderId,
      payment_ref: paymentRef,
      transaction_id: transactionId,
      method,
      paid_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select()
    .single();

  if (updateError) throw updateError;

  const project = payment.projects;
  const client = payment.profiles;

  await admin.from("projects").update({ status: "payment_received" }).eq("id", project.id);

  await notifyPaymentReceived(admin, {
    project: { ...project, status: "payment_received" },
    payment: updatedPayment,
    client,
  });

  return { payment: updatedPayment, outcome: "success" };
}
