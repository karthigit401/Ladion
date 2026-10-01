import "server-only";
import crypto from "crypto";

function secret() {
  return process.env.PAYMENT_WEBHOOK_SECRET || "ladion-demo-webhook-secret";
}

/** HMAC-SHA256 of the raw request body. Real providers (Razorpay, Stripe) sign webhooks the same way. */
export function signPayload(rawBody) {
  return crypto.createHmac("sha256", secret()).update(rawBody).digest("hex");
}

export function verifySignature(rawBody, signature) {
  if (!signature) return false;
  const expected = signPayload(rawBody);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
