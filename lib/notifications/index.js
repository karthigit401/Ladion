import "server-only";
import { sendEmailSimulated } from "./emailSimulated";
import { sendWhatsAppSimulated } from "./whatsappSimulated";

/**
 * sendEmailNotification / sendWhatsAppNotification are the only functions
 * the rest of the app calls. They currently delegate to the simulated
 * senders above and always log a `notifications` row so the admin
 * Notification Center and the client's history have something to show.
 *
 * To go live later: swap the body of these two functions to call Resend /
 * WhatsApp Cloud API instead of the *Simulated helpers, and set the
 * notification status from the real provider's response instead of
 * hardcoding "simulated". No caller of these functions needs to change.
 */

export async function sendEmailNotification(
  adminClient,
  { clientId, projectId, paymentId, to, subject, message }
) {
  const isDemo = process.env.APP_MODE !== "live";
  const result = isDemo
    ? await sendEmailSimulated({ to, subject, message })
    : await sendEmailSimulated({ to, subject, message }); // replace with real sender when going live

  const { data, error } = await adminClient
    .from("notifications")
    .insert({
      client_id: clientId,
      project_id: projectId ?? null,
      payment_id: paymentId ?? null,
      channel: "email",
      recipient: to,
      subject,
      message,
      status: "simulated",
    })
    .select()
    .single();

  if (error) throw error;
  return { notification: data, providerResult: result };
}

export async function sendWhatsAppNotification(
  adminClient,
  { clientId, projectId, paymentId, to, message }
) {
  const isDemo = process.env.APP_MODE !== "live";
  const result = isDemo
    ? await sendWhatsAppSimulated({ to, message })
    : await sendWhatsAppSimulated({ to, message }); // replace with real sender when going live

  const { data, error } = await adminClient
    .from("notifications")
    .insert({
      client_id: clientId,
      project_id: projectId ?? null,
      payment_id: paymentId ?? null,
      channel: "whatsapp",
      recipient: to,
      message,
      status: "simulated",
    })
    .select()
    .single();

  if (error) throw error;
  return { notification: data, providerResult: result };
}
