/**
 * BookingPaymentStep.jsx
 * Drop-in final step for the booking form.
 * Combines PaymentSelector + PaymentButton with a brief booking summary.
 *
 * Props:
 *   bookingFormData   {Object}   — all booking + customer fields collected earlier
 *   totalAmount       {number}   — computed total in INR
 *   onPaymentSuccess  {fn}       ({ booking_id, payment_id, orderData }) => void
 *   onPaymentFailure  {fn}       (message: string) => void
 */

import React, { useState } from "react";
import PaymentSelector from "./PaymentSelector";
import PaymentButton   from "./PaymentButton";

export default function BookingPaymentStep({
  bookingFormData,
  totalAmount,
  onPaymentSuccess,
  onPaymentFailure,
}) {
  const [paymentType, setPaymentType] = useState("deposit");

  // Merge form data with the chosen payment type for the service layer
  const enrichedBookingData = {
    ...bookingFormData,
    total_amount: totalAmount,
    payment_type: paymentType,
  };

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Complete Your Booking</h3>

      {/* Booking summary */}
      <div style={styles.summary}>
        <SummaryRow icon="🐾" label="Pet"      value={bookingFormData.pet_name}  />
        <SummaryRow icon="🏠" label="Service"  value={bookingFormData.service}   />
        <SummaryRow icon="📅" label="Check-in" value={bookingFormData.check_in}  />
        <SummaryRow icon="📅" label="Check-out"value={bookingFormData.check_out} />
      </div>

      <hr style={styles.divider} />

      {/* Payment option picker */}
      <PaymentSelector
        totalAmount={totalAmount}
        paymentType={paymentType}
        onChange={setPaymentType}
      />

      <hr style={styles.divider} />

      {/* Pay button */}
      <PaymentButton
        bookingData={enrichedBookingData}
        onSuccess={onPaymentSuccess}
        onFailure={onPaymentFailure}
      >
        {paymentType === "full" ? "Pay & Save 2%" : "Pay 50% Deposit"}
      </PaymentButton>
    </div>
  );
}

function SummaryRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summaryIcon}>{icon}</span>
      <span style={styles.summaryLabel}>{label}:</span>
      <span style={styles.summaryValue}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
const styles = {
  wrapper: {
    display:       "flex",
    flexDirection: "column",
    gap:           "1rem",
    padding:       "1.5rem",
    borderRadius:  "16px",
    background:    "#fff",
    boxShadow:     "0 4px 24px rgba(0,0,0,0.07)",
    maxWidth:      "640px",
    margin:        "0 auto",
  },
  title: {
    margin:     0,
    fontSize:   "1.25rem",
    fontWeight: 700,
    color:      "#111827",
  },
  summary: {
    display:       "flex",
    flexDirection: "column",
    gap:           "0.4rem",
    padding:       "0.75rem 1rem",
    borderRadius:  "10px",
    background:    "#f9fafb",
  },
  summaryRow: {
    display:    "flex",
    alignItems: "center",
    gap:        "0.5rem",
  },
  summaryIcon: {
    fontSize: "0.9rem",
  },
  summaryLabel: {
    fontSize:   "0.82rem",
    color:      "#6b7280",
    minWidth:   "64px",
  },
  summaryValue: {
    fontSize:   "0.85rem",
    fontWeight: 500,
    color:      "#1f2937",
  },
  divider: {
    margin:  0,
    border:  "none",
    borderTop: "1px solid #f3f4f6",
  },
};