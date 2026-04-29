/**
 * paymentService.js
 * Thin wrappers around the FastAPI payment endpoints.
 * All amounts from the API are in INR (rupees); Razorpay amounts are in paise.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "";

/**
 * Ask the backend to create a Razorpay order.
 *
 * @param {Object} bookingData
 * @param {number} bookingData.total_amount   - full service cost in INR
 * @param {string} bookingData.payment_type   - "deposit" | "full"
 * @param {string} bookingData.customer_name
 * @param {string} bookingData.customer_email
 * @param {string} bookingData.customer_phone
 * @param {string} [bookingData.booking_id]   - if you already have a booking doc
 * @param {string} [bookingData.pet_name]
 * @param {string} [bookingData.service]
 * @param {string} [bookingData.check_in]
 * @param {string} [bookingData.check_out]
 * @param {string} [bookingData.notes]
 *
 * @returns {Promise<{
 *   razorpay_order_id: string,
 *   razorpay_key_id: string,
 *   amount: number,          // paise
 *   currency: string,
 *   booking_id: string,
 *   payable_now: number,
 *   total_amount: number,
 *   discount: number,
 *   balance_due: number,
 * }>}
 */
export async function createPaymentOrder(bookingData) {
  const res = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `create-order failed (${res.status})`);
  }

  return res.json();
}

/**
 * Send Razorpay's callback data to the backend for signature verification.
 *
 * @param {{
 *   razorpay_order_id:   string,
 *   razorpay_payment_id: string,
 *   razorpay_signature:  string,
 *   booking_id:          string,
 * }} verifyData
 *
 * @returns {Promise<{ success: boolean, booking_id: string, message: string }>}
 */
export async function verifyPayment(verifyData) {
  const res = await fetch(`${API_BASE}/api/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(verifyData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `verify failed (${res.status})`);
  }

  return res.json();
}