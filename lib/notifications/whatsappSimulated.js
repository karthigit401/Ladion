import "server-only";

/**
 * Simulated WhatsApp "send". No call to Meta's Cloud API. Swapping this
 * for the real integration later means implementing the same shape here
 * against https://graph.facebook.com/v19.0/{phone-number-id}/messages
 * with an approved message template, and nothing else in the app changes.
 */
export async function sendWhatsAppSimulated({ to, message }) {
  return {
    provider: "simulated",
    id: `sim-wa-${Date.now()}`,
    to,
    message,
    sentAt: new Date().toISOString(),
  };
}
