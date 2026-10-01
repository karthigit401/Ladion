import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/payments/signature";
import { processPaymentWebhookEvent } from "@/lib/payments/webhookHandler";

/**
 * Payment provider webhook endpoint.
 * Demo: the dummy provider calls this (server to server) after a simulated charge.
 * Live: Razorpay would POST here; only the signature check below changes
 * (use Razorpay's X-Razorpay-Signature + webhook secret).
 */
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-ladion-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed event." }, { status: 400 });
  }
  if (!event.paymentId || !event.outcome) {
    return NextResponse.json({ error: "Missing paymentId or outcome." }, { status: 400 });
  }

  try {
    const result = await processPaymentWebhookEvent(event);
    return NextResponse.json({ received: true, outcome: result.outcome || "already_processed" });
  } catch (err) {
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
