import "server-only";

/**
 * RazorpayPaymentProvider — NOT implemented. Placeholder showing the shape
 * a real implementation must satisfy so it drops into lib/payments/index.js
 * with no changes to any calling code (API routes, UI, webhook handler).
 *
 * To wire this up later:
 *   1. `npm install razorpay`
 *   2. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in your environment.
 *   3. Implement createOrder() using razorpay.orders.create(...).
 *   4. Implement signature verification in
 *      app/api/payments/webhook/route.js using Razorpay's webhook secret
 *      (crypto.createHmac('sha256', secret)) instead of the dummy
 *      passthrough currently there.
 *   5. Switch PAYMENT_PROVIDER=razorpay (see lib/payments/index.js).
 *   6. The client-side "Pay Now" flow then opens Razorpay Checkout instead
 *      of the simulated gateway UI at /client/payment/[paymentId].
 */
export const RazorpayPaymentProvider = {
  name: "razorpay",

  async createOrder() {
    throw new Error(
      "RazorpayPaymentProvider is not implemented yet. See lib/payments/razorpay.js for the integration steps."
    );
  },

  async charge() {
    throw new Error("RazorpayPaymentProvider is not implemented yet.");
  },
};
