import "server-only";

/**
 * Simulated email "send". No network call — this is where a real
 * integration (Resend, SES, Postmark...) would plug in later. The return
 * shape is intentionally what most email providers return, so swapping
 * this out doesn't change any calling code.
 */
export async function sendEmailSimulated({ to, subject, message }) {
  return {
    provider: "simulated",
    id: `sim-email-${Date.now()}`,
    to,
    subject,
    message,
    sentAt: new Date().toISOString(),
  };
}
