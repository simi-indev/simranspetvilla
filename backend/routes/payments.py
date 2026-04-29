from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import db, RAZORPAY_KEY_ID
from utils.payment import create_razorpay_order, verify_payment_signature

router = APIRouter(prefix="/payments", tags=["payments"])


class CreateOrderRequest(BaseModel):
    total_amount: float
    payment_type: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_data: dict
    total_amount: float
    payment_type: str


@router.post("/create-order")
async def create_order(payload: CreateOrderRequest):
    try:
        order = create_razorpay_order(
            amount_paise=int(payload.total_amount * 100),
            receipt=f"petvilla_{int(datetime.utcnow().timestamp())}"
        )

        return {
            "key_id": RAZORPAY_KEY_ID,
            "order": order
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify")
async def verify_payment(payload: VerifyPaymentRequest):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    is_valid = verify_payment_signature(
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    booking = payload.booking_data
    booking["payment_status"] = "confirmed"
    booking["razorpay_payment_id"] = payload.razorpay_payment_id
    booking["razorpay_order_id"] = payload.razorpay_order_id
    booking["total_amount"] = payload.total_amount
    booking["payment_type"] = payload.payment_type
    booking["created_at"] = datetime.utcnow()

    result = await db.bookings.insert_one(booking)

    return {
        "success": True,
        "booking_id": str(result.inserted_id)
    }