/**
 * PaymentButton.jsx
 * Orchestrates the full Razorpay checkout flow:
 *   1. Calls backend to create Razorpay order
 *   2. Opens Razorpay checkout modal
 *   3. Verifies payment with backend on success
 *   4. Calls onSuccess / onFailure callbacks
 *
 * Props:
 *   bookingData       {Object}  — merged booking + customer fields
 *   disabled          {boolean}
 *   onSuccess         {fn}      ({ booking_id, payment_id }) => void
 *   onFailure         {fn}      (errorMessage: string) => void
 *   children          {node}    — button label (default: "Pay Now")
 */

import React, { useState } from "react";
import { useRazorpay } from "../../hooks/useRazorpay";
import { createPaymentOrder, verifyPayment } from "../../services/paymentService";

const BRAND_COLOR = "#f97316"; // pet-villa orange — change to your brand hex

export default function PaymentButton({
  bookingData,
  disabled    = false,
  onSuccess,
  onFailure,
  children    = "Pay Now",
}) {
  const { isLoaded: rzpLoaded, isError: rzpError } = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function handlePayment() {
    setError(null);
    setLoading(true);

    let orderData;

    try {
      // ── Step 1: create Razorpay order on the backend ───────────────────
      orderData = await createPaymentOrder(bookingData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      onFailure?.(err.message);
      return;
    }

    // ── Step 2: open Razorpay checkout ────────────────────────────────────
    const options = {
      key:         orderData.razorpay_key_id,
      amount:      orderData.amount,          // paise
      currency:    orderData.currency,
      name:        "Simran's Pet Villa",
      description: buildDescription(bookingData),
      image:       "/logo.png",               // your logo path
      order_id:    orderData.razorpay_order_id,

      prefill: {
        name:    bookingData.customer_name,
        email:   bookingData.customer_email,
        contact: bookingData.customer_phone,
      },

      notes: {
        booking_id:   orderData.booking_id,
        payment_type: bookingData.payment_type,
        pet_name:     bookingData.pet_name ?? "",
      },

      theme: { color: BRAND_COLOR },

      // ── Step 3: verify on success ───────────────────────────────────────
      handler: async (response) => {
        try {
          const result = await verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            booking_id:          orderData.booking_id,
          });

          setLoading(false);
          onSuccess?.({
            booking_id: result.booking_id,
            payment_id: response.razorpay_payment_id,
            orderData,
          });
        } catch (err) {
          setLoading(false);
          setError("Payment received but verification failed. Please contact us.");
          onFailure?.(err.message);
        }
      },

      modal: {
        ondismiss: () => {
          setLoading(false);
          setError("Payment was cancelled.");
          onFailure?.("Payment was cancelled.");
        },
        confirm_close: true,
        escape:        false,
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (response) => {
      setLoading(false);
      const msg = response.error?.description ?? "Payment failed. Please try again.";
      setError(msg);
      onFailure?.(msg);
    });

    rzp.open();
    // setLoading(false) is called inside handler / ondismiss — not here
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const isDisabled = disabled || loading || !rzpLoaded;

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={handlePayment}
        disabled={isDisabled}
        style={{
          ...styles.button,
          ...(isDisabled ? styles.buttonDisabled : {}),
          ...(loading    ? styles.buttonLoading  : {}),
        }}
      >
        {loading ? (
          <span style={styles.spinnerWrap}>
            <Spinner />
            <span>Processing…</span>
          </span>
        ) : (
          children
        )}
      </button>

      {rzpError && (
        <p style={styles.errorMsg}>
          ⚠️ Could not load payment gateway. Please refresh and try again.
        </p>
      )}

      {error && !rzpError && (
        <p style={styles.errorMsg}>⚠️ {error}</p>
      )}

      <p style={styles.secureBadge}>🔒 Secured by Razorpay</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDescription(bookingData) {
  const parts = ["Pet Boarding"];
  if (bookingData.pet_name) parts.push(`for ${bookingData.pet_name}`);
  if (bookingData.service)  parts.push(`— ${bookingData.service}`);
  return parts.join(" ");
}

function Spinner() {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ animation: "rzp-spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes rzp-spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = {
  container: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "stretch",
    gap:           "0.5rem",
  },
  button: {
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             "0.5rem",
    padding:         "0.85rem 1.5rem",
    borderRadius:    "10px",
    border:          "none",
    background:      BRAND_COLOR,
    color:           "#fff",
    fontSize:        "1rem",
    fontWeight:      700,
    cursor:          "pointer",
    transition:      "background 0.15s, opacity 0.15s, transform 0.1s",
    letterSpacing:   "0.02em",
  },
  buttonDisabled: {
    background: "#d1d5db",
    cursor:     "not-allowed",
    transform:  "none",
  },
  buttonLoading: {
    opacity: 0.85,
    cursor:  "wait",
  },
  spinnerWrap: {
    display:    "flex",
    alignItems: "center",
    gap:        "0.4rem",
  },
  errorMsg: {
    margin:     0,
    fontSize:   "0.82rem",
    color:      "#ef4444",
    lineHeight: 1.4,
  },
  secureBadge: {
    margin:     0,
    fontSize:   "0.75rem",
    color:      "#9ca3af",
    textAlign:  "center",
  },
};

