"""
Payment utilities for Simran's Pet Villa.
Handles amount calculations and Razorpay order creation/verification.
"""

import hmac
import hashlib
import razorpay
from functools import lru_cache

from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET


DISCOUNT_RATE = 0.02       # 2% discount for full payment
DEPOSIT_RATE  = 0.50       # 50% deposit option


@lru_cache(maxsize=1)
def get_razorpay_client() -> razorpay.Client:
    """Cached Razorpay client — created once per process."""
    return razorpay.Client(
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )


# ---------------------------------------------------------------------------
# Amount helpers
# ---------------------------------------------------------------------------

def calculate_payable_amount(total_amount: float, payment_type: str) -> dict:
    """
    Returns a breakdown dict for the chosen payment_type.

    payment_type values:
        "deposit" — 50 % of total, no discount
        "full"    — 100 % with 2 % discount
    """
    if payment_type == "deposit":
        payable     = round(total_amount * DEPOSIT_RATE, 2)
        discount    = 0.0
        balance_due = round(total_amount - payable, 2)
    elif payment_type == "full":
        discount    = round(total_amount * DISCOUNT_RATE, 2)
        payable     = round(total_amount - discount, 2)
        balance_due = 0.0
    else:
        raise ValueError(f"Invalid payment_type: '{payment_type}'")

    return {
        "total_amount":     round(total_amount, 2),
        "discount":         discount,
        "payable_now":      payable,
        "balance_due":      balance_due,
        "razorpay_amount":  int(payable * 100),   # paise
        "currency":         "INR",
    }


# ---------------------------------------------------------------------------
# Razorpay order
# ---------------------------------------------------------------------------

def create_razorpay_order(amount_paise: int, receipt: str, notes: dict | None = None) -> dict:
    client = get_razorpay_client()

    return client.order.create({
        "amount":   amount_paise,
        "currency": "INR",
        "receipt":  receipt[:40],
        "notes":    notes or {},
        "payment_capture": 1,
    })


# ---------------------------------------------------------------------------
# Signature verification
# ---------------------------------------------------------------------------

def verify_payment_signature(
    razorpay_order_id:   str,
    razorpay_payment_id: str,
    razorpay_signature:  str,
) -> bool:
    message = f"{razorpay_order_id}|{razorpay_payment_id}".encode()

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_signature, razorpay_signature)