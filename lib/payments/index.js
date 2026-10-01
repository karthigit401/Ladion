import "server-only";
import { DummyPaymentProvider } from "./dummy";
import { RazorpayPaymentProvider } from "./razorpay";

/**
 * Every provider must implement:
 *   createOrder({ payment })        -> { orderId }
 *   charge({ payment, orderId, method, forceOutcome }) ->
 *       { outcome: 'success', paymentRef, transactionId, method }
 *     | { outcome: 'failure', reason }
 *
 * Selected by PAYMENT_PROVIDER env var. Demo mode always forces "dummy"
 * regardless of that setting, as a safety net against ever accidentally
 * hitting a real payment gateway while APP_MODE=demo.
 */
export function getPaymentProvider() {
  const isDemo = process.env.APP_MODE !== "live";
  const configured = process.env.PAYMENT_PROVIDER || "dummy";

  if (isDemo) return DummyPaymentProvider;
  if (configured === "razorpay") return RazorpayPaymentProvider;
  return DummyPaymentProvider;
}
