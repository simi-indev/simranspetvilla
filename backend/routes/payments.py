from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from config import db, RAZORPAY_KEY_ID
from utils.payment import create_razorpay_order, verify_payment_signature, calculate_payable_amount
from utils.telegram import notify_payment_confirmed

router = APIRouter(prefix="/payments", tags=["payments"])


class CreateOrderRequest(BaseModel):
    total_amount: float
    payment_type: str  # "deposit" | "full"
    # Booking fields
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    pet_name: Optional[str] = None
    service: Optional[str] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    notes: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_id: str


@router.post("/create-order")
async def create_order(payload: CreateOrderRequest):
    try:
        # Calculate correct payable amount
        breakdown = calculate_payable_amount(payload.total_amount, payload.payment_type)
        receipt = f"petvilla_{int(datetime.utcnow().timestamp())}"

        order = create_razorpay_order(
            amount_paise=breakdown["razorpay_amount"],
            receipt=receipt,
            notes={
                "customer_name": payload.customer_name or "",
                "pet_name": payload.pet_name or "",
                "payment_type": payload.payment_type,
            }
        )

        # Save pending booking to DB
        if db is not None:
            await db.bookings.insert_one({
                "booking_id": receipt,
                "razorpay_order_id": order["id"],
                "payment_status": "pending",
                "payment_type": payload.payment_type,
                "total_amount": payload.total_amount,
                "payable_now": breakdown["payable_now"],
                "discount": breakdown["discount"],
                "balance_due": breakdown["balance_due"],
                "customer_name": payload.customer_name,
                "customer_email": payload.customer_email,
                "customer_phone": payload.customer_phone,
                "pet_name": payload.pet_name,
                "service": payload.service,
                "check_in": payload.check_in,
                "check_out": payload.check_out,
                "notes": payload.notes,
                "created_at": datetime.utcnow().isoformat(),
            })

        # Return format frontend expects
        return {
            "razorpay_key_id": RAZORPAY_KEY_ID,
            "razorpay_order_id": order["id"],
            "amount": breakdown["razorpay_amount"],
            "currency": "INR",
            "booking_id": receipt,
            "payable_now": breakdown["payable_now"],
            "total_amount": payload.total_amount,
            "discount": breakdown["discount"],
            "balance_due": breakdown["balance_due"],
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify")
async def verify_payment(payload: VerifyPaymentRequest):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    # Verify Razorpay signature
    is_valid = verify_payment_signature(
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature,
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Update booking to confirmed
    await db.bookings.update_one(
        {"booking_id": payload.booking_id},
        {"$set": {
            "payment_status": "confirmed",
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_order_id": payload.razorpay_order_id,
            "confirmed_at": datetime.utcnow().isoformat(),
        }}
    )

    await notify_payment_confirmed(
        payload.booking_id,
        payload.razorpay_payment_id,
        0
    )
    return {
        "success": True,
        "booking_id": payload.booking_id,
        "message": "Payment confirmed!"
    }