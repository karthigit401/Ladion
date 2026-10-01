import "server-only";
import { sendEmailNotification, sendWhatsAppNotification } from "@/lib/notifications";
import { PROJECT_STATUS_LABELS, formatCurrency } from "@/lib/demo";

async function logActivity(adminClient, { projectId, actorId, action, meta }) {
  await adminClient.from("activity_log").insert({
    project_id: projectId ?? null,
    actor_id: actorId ?? null,
    action,
    meta: meta || {},
  });
}

/** Called once a payment is verified as paid (see lib/payments/webhookHandler.js). */
export async function notifyPaymentReceived(adminClient, { project, payment, client }) {
  const amountText = formatCurrency(payment.amount, payment.currency);

  await sendEmailNotification(adminClient, {
    clientId: client.id,
    projectId: project.id,
    paymentId: payment.id,
    to: client.email,
    subject: "Payment Confirmation \u2014 Ladion Technologies",
    message: `Your payment of ${amountText} has been successfully received for project ${project.name}. Transaction: ${payment.transaction_id}.`,
  });

  if (client.whatsapp_opt_in !== false) await sendWhatsAppNotification(adminClient, {
    clientId: client.id,
    projectId: project.id,
    paymentId: payment.id,
    to: client.phone || "+91-00000-00000",
    message: `Hello ${client.full_name || "there"},\nYour payment of ${amountText} for ${project.name} has been successfully received.\nTransaction: ${payment.transaction_id}\nThank you for choosing Ladion Technologies.`,
  });

  await logActivity(adminClient, {
    projectId: project.id,
    actorId: null,
    action: "payment_received",
    meta: { payment_id: payment.id, amount: payment.amount, currency: payment.currency },
  });
}

/** Called whenever an admin changes a project's status. */
export async function notifyStatusChanged(adminClient, { project, client, newStatus, actorId }) {
  const label = PROJECT_STATUS_LABELS[newStatus] || newStatus;

  await sendEmailNotification(adminClient, {
    clientId: client.id,
    projectId: project.id,
    to: client.email,
    subject: `Project Update \u2014 ${project.name}`,
    message: `Your project "${project.name}" status has been updated to: ${label}.`,
  });

  if (client.whatsapp_opt_in !== false) await sendWhatsAppNotification(adminClient, {
    clientId: client.id,
    projectId: project.id,
    to: client.phone || "+91-00000-00000",
    message: `Your Ladion project "${project.name}" has moved to ${label}.`,
  });

  await logActivity(adminClient, {
    projectId: project.id,
    actorId,
    action: "status_changed",
    meta: { new_status: newStatus },
  });
}

export async function logProjectSubmitted(adminClient, { project, actorId }) {
  await logActivity(adminClient, {
    projectId: project.id,
    actorId,
    action: "project_submitted",
    meta: { name: project.name },
  });
}

export async function logPaymentRequestCreated(adminClient, { project, payment, actorId }) {
  await logActivity(adminClient, {
    projectId: project.id,
    actorId,
    action: "payment_requested",
    meta: { payment_id: payment.id, amount: payment.amount, currency: payment.currency },
  });
}
