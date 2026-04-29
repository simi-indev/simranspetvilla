/**
 * PaymentSelector.jsx
 * Lets the user choose between:
 *   • 50 % deposit now  (pay the rest on arrival / as agreed)
 *   • 100 % upfront     with 2 % discount
 *
 * Props:
 *   totalAmount   {number}   full booking cost in INR
 *   paymentType   {string}   "deposit" | "full"
 *   onChange      {fn}       (newType: string) => void
 */

import React, { useMemo } from "react";

const DEPOSIT_RATE  = 0.5;
const DISCOUNT_RATE = 0.02;

function fmt(amount) {
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PaymentSelector({ totalAmount, paymentType, onChange }) {
  const breakdown = useMemo(() => {
    const depositNow  = totalAmount * DEPOSIT_RATE;
    const discount    = totalAmount * DISCOUNT_RATE;
    const fullPayable = totalAmount - discount;

    return {
      deposit: {
        payNow:     depositNow,
        balanceDue: totalAmount - depositNow,
        discount:   0,
        savings:    null,
        label:      "Pay 50% Deposit",
        badge:      "Flexible",
        badgeColor: "#5b8dee",
        desc:       "Secure your booking with half the amount. Remaining balance due on arrival.",
      },
      full: {
        payNow:     fullPayable,
        balanceDue: 0,
        discount:   discount,
        savings:    discount,
        label:      "Pay in Full",
        badge:      "Save 2%",
        badgeColor: "#22c55e",
        desc:       "Pay the full amount now and enjoy a 2% discount. Nothing to pay later.",
      },
    };
  }, [totalAmount]);

  const options = ["deposit", "full"];

  return (
    <div style={styles.wrapper}>
      <p style={styles.heading}>Choose Payment Option</p>

      <div style={styles.grid}>
        {options.map((type) => {
          const info     = breakdown[type];
          const selected = paymentType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              style={{
                ...styles.card,
                ...(selected ? styles.cardSelected : {}),
              }}
              aria-pressed={selected}
            >
              {/* Badge */}
              <span style={{ ...styles.badge, backgroundColor: info.badgeColor }}>
                {info.badge}
              </span>

              {/* Radio indicator */}
              <span style={styles.radioWrap}>
                <span style={{
                  ...styles.radioOuter,
                  borderColor: selected ? "#f97316" : "#d1d5db",
                }}>
                  {selected && <span style={styles.radioInner} />}
                </span>
                <span style={styles.cardLabel}>{info.label}</span>
              </span>

              <p style={styles.desc}>{info.desc}</p>

              {/* Amount rows */}
              <div style={styles.amountTable}>
                <AmountRow label="Total amount"   value={fmt(totalAmount)}    />
                {info.discount > 0 && (
                  <AmountRow
                    label="Discount (2%)"
                    value={`− ${fmt(info.discount)}`}
                    valueStyle={{ color: "#22c55e" }}
                  />
                )}
                <AmountRow
                  label="Pay now"
                  value={fmt(info.payNow)}
                  valueStyle={{ fontWeight: 700, color: "#1e293b", fontSize: "1rem" }}
                />
                {info.balanceDue > 0 && (
                  <AmountRow
                    label="Balance due later"
                    value={fmt(info.balanceDue)}
                    valueStyle={{ color: "#64748b" }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AmountRow({ label, value, valueStyle = {} }) {
  return (
    <div style={styles.amountRow}>
      <span style={styles.amountLabel}>{label}</span>
      <span style={{ ...styles.amountValue, ...valueStyle }}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline styles (no CSS file dependency)
// ---------------------------------------------------------------------------
const styles = {
  wrapper: {
    display:       "flex",
    flexDirection: "column",
    gap:           "0.75rem",
  },
  heading: {
    margin:     0,
    fontWeight: 600,
    fontSize:   "0.9rem",
    color:      "#374151",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  grid: {
    display:  "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap:      "0.75rem",
  },
  card: {
    position:      "relative",
    display:       "flex",
    flexDirection: "column",
    gap:           "0.6rem",
    padding:       "1.25rem 1rem",
    borderRadius:  "12px",
    border:        "2px solid #e5e7eb",
    background:    "#fff",
    textAlign:     "left",
    cursor:        "pointer",
    transition:    "border-color 0.15s, box-shadow 0.15s",
    outline:       "none",
  },
  cardSelected: {
    borderColor: "#f97316",
    boxShadow:   "0 0 0 3px rgba(249,115,22,0.15)",
    background:  "#fffaf7",
  },
  badge: {
    position:     "absolute",
    top:          "-10px",
    right:        "12px",
    padding:      "2px 10px",
    borderRadius: "999px",
    fontSize:     "0.7rem",
    fontWeight:   700,
    color:        "#fff",
    letterSpacing:"0.04em",
  },
  radioWrap: {
    display:    "flex",
    alignItems: "center",
    gap:        "0.5rem",
  },
  radioOuter: {
    width:        "18px",
    height:       "18px",
    borderRadius: "50%",
    border:       "2px solid #d1d5db",
    display:      "flex",
    alignItems:   "center",
    justifyContent:"center",
    flexShrink:   0,
    transition:   "border-color 0.15s",
  },
  radioInner: {
    width:        "8px",
    height:       "8px",
    borderRadius: "50%",
    background:   "#f97316",
  },
  cardLabel: {
    fontWeight: 600,
    fontSize:   "0.95rem",
    color:      "#111827",
  },
  desc: {
    margin:     0,
    fontSize:   "0.8rem",
    color:      "#6b7280",
    lineHeight: 1.5,
  },
  amountTable: {
    display:       "flex",
    flexDirection: "column",
    gap:           "0.3rem",
    marginTop:     "0.25rem",
    borderTop:     "1px solid #f3f4f6",
    paddingTop:    "0.6rem",
  },
  amountRow: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
  },
  amountLabel: {
    fontSize: "0.78rem",
    color:    "#9ca3af",
  },
  amountValue: {
    fontSize:   "0.85rem",
    fontWeight: 500,
    color:      "#374151",
  },
};