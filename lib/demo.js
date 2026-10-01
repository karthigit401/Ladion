export function isDemoMode() {
  return process.env.APP_MODE !== "live";
}

export const PROJECT_STATUS_LABELS = {
  requirements_received: "Requirements Received",
  payment_pending: "Payment Pending",
  payment_received: "Payment Received",
  under_review: "Under Review",
  in_progress: "In Progress",
  testing: "Testing",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Order used to render the client-facing project timeline.
export const PROJECT_TIMELINE_STEPS = [
  { key: "requirements_received", label: "Requirements submitted" },
  { key: "payment_received", label: "Payment received" },
  { key: "under_review", label: "Project review" },
  { key: "in_progress", label: "Development" },
  { key: "testing", label: "Testing" },
  { key: "completed", label: "Delivery" },
];

export const PAYMENT_STATUS_LABELS = {
  created: "Payment Requested",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function formatCurrency(amount, currency = "INR") {
  const symbol = currency === "INR" ? "\u20B9" : currency + " ";
  const n = Number(amount);
  return `${symbol}${n.toLocaleString("en-IN")}`;
}

export function formatDate(value) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function statusTone(status) {
  switch (status) {
    case "completed":
    case "paid":
    case "delivered":
      return "success";
    case "payment_pending":
    case "created":
    case "processing":
    case "simulated":
      return "warning";
    case "cancelled":
    case "failed":
      return "danger";
    default:
      return "accent";
  }
}

export const ALLOWED_UPLOAD_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "application/zip",
  "text/plain",
];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
