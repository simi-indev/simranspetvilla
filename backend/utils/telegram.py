"""
Telegram notifications for Simran's Pet Villa.
Sends messages to the PetVilla Bookings group.
"""
import httpx
import os

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID")

TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"


async def send_telegram(message: str):
    """Send a message to the PetVilla Bookings group."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram not configured — skipping notification")
        return
    try:
        async with httpx.AsyncClient() as client:
            await client.post(TELEGRAM_API, json={
                "chat_id":    TELEGRAM_CHAT_ID,
                "text":       message,
                "parse_mode": "HTML",
            }, timeout=5)
    except Exception as e:
        print(f"Telegram notification failed: {e}")


async def notify_new_booking(booking: dict):
    msg = (
        f"🐾 <b>New Booking!</b>\n\n"
        f"👤 <b>Customer:</b> {booking.get('owner', {}).get('name', 'Unknown')}\n"
        f"📱 <b>Phone:</b> {booking.get('owner', {}).get('phone', '—')}\n"
        f"🐶 <b>Pet:</b> {booking.get('pets', [{}])[0].get('name', '—')} "
        f"({booking.get('pets', [{}])[0].get('species', '—')})\n"
        f"🏠 <b>Service:</b> {', '.join(booking.get('services', []))}\n"
        f"📅 <b>From:</b> {booking.get('start_date', '—')}\n"
        f"💰 <b>Amount:</b> ₹{booking.get('estimated_price', '—')}\n"
        f"💳 <b>Payment:</b> {booking.get('payment_type', '—')}\n\n"
        f"👉 Check admin: simranspetvilla.com/admin"
    )
    await send_telegram(msg)


async def notify_payment_confirmed(booking_id: str, payment_id: str, amount: float):
    msg = (
        f"✅ <b>Payment Confirmed!</b>\n\n"
        f"🔖 <b>Booking ID:</b> {booking_id}\n"
        f"💳 <b>Payment ID:</b> {payment_id}\n"
        f"💰 <b>Amount paid:</b> ₹{amount}\n\n"
        f"👉 Check admin: simranspetvilla.com/admin"
    )
    await send_telegram(msg)


async def notify_new_lead(lead: dict):
    msg = (
        f"📩 <b>New Contact Lead!</b>\n\n"
        f"👤 <b>Name:</b> {lead.get('name', '—')}\n"
        f"📱 <b>Phone:</b> {lead.get('phone', '—')}\n"
        f"📧 <b>Email:</b> {lead.get('email', '—')}\n"
        f"💬 <b>Message:</b> {lead.get('message', '—')}\n\n"
        f"👉 Check admin: simranspetvilla.com/admin"
    )
    await send_telegram(msg)
    