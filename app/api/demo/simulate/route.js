import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, ok, fail } from "@/lib/api";
import { getPaymentProvider } from "@/lib/payments";
import { processPaymentWebhookEvent } from "@/lib/payments/webhookHandler";
import { isDemoMode } from "@/lib/demo";

export async function POST(request) {
  if (!isDemoMode()) return fail("Not available outside demo mode.", 404);
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") return fail("Forbidden.", 403);

  const body = await request.json().catch(() => null);
  if (!body?.action) return fail("Missing action.");
  const admin = createAdminClient();

  if (["payment_success", "payment_failure", "payment_cancel"].includes(body.action)) {
    const { data: payment } = await admin.from("payments").select("*").eq("id", body.paymentId).single();
    if (!payment) return fail("Payment not found.", 404);
    if (["paid", "cancelled"].includes(payment.status)) return fail(`Payment is already ${payment.status}.`, 409);

    if (payment.status === "failed") {
      await admin.from("payments").update({ status: "processing" }).eq("id", payment.id);
    }
    if (body.action === "payment_cancel") {
      const r = await processPaymentWebhookEvent({ paymentId: payment.id, outcome: "cancelled" });
      return ok({ result: r.outcome });
    }
    const provider = getPaymentProvider();
    const { orderId } = await provider.createOrder({ payment });
    const charge = await provider.charge({
      payment, orderId, method: payment.method || "upi",
      forceOutcome: body.action === "payment_failure" ? "failure" : "success",
    });
    const r = await processPaymentWebhookEvent({
      paymentId: payment.id, outcome: charge.outcome, orderId,
      paymentRef: charge.paymentRef, transactionId: charge.transactionId,
      method: charge.method, reason: charge.reason,
    });
    return ok({ result: r.outcome });
  }

  if (body.action === "notification_delivered") {
    const { error } = await admin.from("notifications").update({ status: "delivered" }).eq("id", body.notificationId);
    if (error) return fail(error.message, 500);
    return ok({ result: "delivered" });
  }

  if (body.action === "all_delivered") {
    await admin.from("notifications").update({ status: "delivered" }).eq("status", "simulated");
    return ok({ result: "all delivered" });
  }

  return fail("Unknown action.");
}
