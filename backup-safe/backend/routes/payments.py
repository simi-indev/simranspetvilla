from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import db, RAZORPAY_KEY_ID
from utils.payment import create_razorpay_order, verify_razorpay_signature

router = APIRouter(prefix="/api/payments", tags=["payments"])


class CreateOrderRequest(BaseModel):
    total_amount: float
    payment_type: str


class VerifyPaymentRequest(BaseModel):
    booking_data: dict
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    payment_type: str
    total_amount: float


@router.post("/create-order")
async def create_order(payload: CreateOrderRequest):
    try:
        order = create_razorpay_order(
            total_amount=payload.total_amount,
            payment_type=payload.payment_type,
            receipt=f"petvilla_{int(datetime.utcnow().timestamp())}"
        )

        return {
            "key_id": RAZORPAY_KEY_ID,
            "order": order,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify")
async def verify_payment(payload: VerifyPaymentRequest):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    is_valid = verify_razorpay_signature(
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    booking = payload.booking_data
    booking["payment_type"] = payload.payment_type
    booking["total_amount"] = payload.total_amount
    booking["payment_status"] = "confirmed"
    booking["razorpay_order_id"] = payload.razorpay_order_id
    booking["razorpay_payment_id"] = payload.razorpay_payment_id
    booking["created_at"] = datetime.utcnow()

    result = await db.bookings.insert_one(booking)

    return {
        "success": True,
        "booking_id": str(result.inserted_id),
        "payment_id": payload.razorpay_payment_id,
    }