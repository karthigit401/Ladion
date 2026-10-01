import "server-only";

function randomRef(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/**
 * DummyPaymentProvider — simulates a payment gateway entirely in-process.
 * No network calls, no real money. Implements the same shape a real
 * RazorpayPaymentProvider would (see razorpay.js), so the rest of the
 * app never needs to know which provider is active.
 */
export const DummyPaymentProvider = {
  name: "dummy",

  /** Create an "order" for a payment — mirrors Razorpay's orders.create(). */
  async createOrder({ payment }) {
    const orderId = `LAD-ORD-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`;
    return { orderId };
  },

  /**
   * Simulate the checkout + provider processing step. Always succeeds
   * unless the caller explicitly forces a failure (used by the demo
   * control panel to demonstrate the failure path).
   */
  async charge({ payment, orderId, method, forceOutcome }) {
    // Small artificial delay so the "Processing..." state is visible in the UI.
    await new Promise((resolve) => setTimeout(resolve, 700));

    const outcome = forceOutcome || "success";

    if (outcome === "failure") {
      return { outcome: "failure", reason: "Simulated decline by payment provider." };
    }

    return {
      outcome: "success",
      paymentRef: randomRef("LAD-PAY"),
      transactionId: randomRef("LAD-TXN"),
      method,
    };
  },
};
