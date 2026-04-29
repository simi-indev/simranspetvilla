import hmac
import hashlib
import razorpay

from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET


def get_razorpay_client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise ValueError("Razorpay keys are missing")

    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


def calculate_payable_amount(total_amount: float, payment_type: str) -> int:
    """
    Returns amount in paise.
    payment_type:
    - deposit = 50%
    - full = 100% with 2% discount
    """

    if total_amount <= 0:
        raise ValueError("Total amount must be greater than zero")

    if payment_type == "deposit":
        payable = total_amount * 0.5
    elif payment_type == "full":
        payable = total_amount * 0.98
    else:
        raise ValueError("Invalid payment type")

    return int(round(payable * 100))


def create_razorpay_order(total_amount: float, payment_type: str, receipt: str):
    client = get_razorpay_client()

    amount_paise = calculate_payable_amount(total_amount, payment_type)

    return client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "payment_capture": 1,
    })


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    body = f"{order_id}|{payment_id}"

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_signature, signature)