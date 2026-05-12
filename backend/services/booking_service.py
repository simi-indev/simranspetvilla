"""
Public-facing business logic.
Called by routes/public.py — routes stay thin, logic lives here.
"""
import logging
from config import db
from models import Booking, BookingCreate, Contact, ContactCreate
from data.defaults import DEFAULT_BUSINESS_INFO, DEFAULT_HOMEPAGE_CONTENT
from data.services import SERVICES
from data.blogs import BLOGS
from services import pricing_service

logger = logging.getLogger(__name__)
# ── Email Notification ──
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_notification(booking):
    try:
        sender = os.environ.get("NOTIFY_EMAIL")
        password = os.environ.get("NOTIFY_EMAIL_PASSWORD")
        if not sender or not password:
            logger.warning("Email notification not configured")
            return

        pet_name = booking.pet.name if hasattr(booking.pet, 'name') else "Unknown"
        owner_name = booking.owner.name if hasattr(booking.owner, 'name') else "Unknown"
        owner_phone = booking.owner.phone if hasattr(booking.owner, 'phone') else ""
        owner_email = booking.owner.email or "Not provided"
        services = ", ".join(booking.services) if booking.services else ""
        start_date = booking.start_date or ""
        price = booking.estimated_price or 0
        payment_type = "50% deposit" if booking.payment_type == "50%" else "Full payment (2% off)"

        subject = f"🐾 New Booking — {pet_name} ({owner_name})"
        body = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #2D6A4F; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
    <h2 style="margin:0">🐾 New Booking Alert!</h2>
    <p style="margin:5px 0 0 0; opacity:0.85;">Simran's Pet Villa</p>
  </div>
  <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
    <table style="width:100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold; color: #555; width:40%;">👤 Owner</td>
        <td style="padding: 10px;">{owner_name}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold; color: #555;">📞 Phone</td>
        <td style="padding: 10px;">{owner_phone}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold; color: #555;">📧 Email</td>
        <td style="padding: 10px;">{owner_email}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold; color: #555;">🐶 Pet</td>
        <td style="padding: 10px;">{pet_name}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold; color: #555;">🛎️ Services</td>
        <td style="padding: 10px;">{services}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold; color: #555;">📅 Start Date</td>
        <td style="padding: 10px;">{start_date}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold; color: #555;">💰 Amount</td>
        <td style="padding: 10px;">₹{price}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #555;">💳 Payment</td>
        <td style="padding: 10px;">{payment_type}</td>
      </tr>
    </table>
    <div style="margin-top: 20px; text-align: center;">
      <a href="https://simranspetvilla.com/admin/dashboard"
         style="background: #2D6A4F; color: white; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-weight: bold;">
        View in Dashboard →
      </a>
    </div>
    <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
      Automated notification from simranspetvilla.com
    </p>
  </div>
</body>
</html>"""

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Simran's Pet Villa <{sender}>"
        msg["To"] = sender
        msg["Reply-To"] = "hello@simranspetvilla.com"
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.sendmail(sender, sender, msg.as_string())

        logger.info("Email notification sent successfully")
    except Exception as e:
        logger.warning(f"Email notification failed (non-critical): {e}")

# ── Services ──

async def get_all_services():
    """Return services from DB, fall back to catalog if DB empty or error."""
    try:
        if db is not None:
            services = await db.services.find({}, {"_id": 0}).to_list(50)
            if services:
                return services
    except Exception as e:
        logger.error(f"DB Error fetching services: {e}")
    
    return SERVICES


async def get_service_by_slug(slug: str):
    """
    Find a single service by slug.
    Flow: 1. Check DB  2. Check catalog  3. Return None if not found
    """
    try:
        if db is not None:
            service = await db.services.find_one({"slug": slug}, {"_id": 0})
            if service:
                return service
    except Exception as e:
        logger.error(f"DB Error fetching service {slug}: {e}")

    for s in SERVICES:
        if s["slug"] == slug:
            return s
    return None


# ── Reviews ──

async def get_public_reviews():
    """
    Return reviews visible to public.
    Filter: rating >= 4 AND visible == true.
    Negative/hidden reviews are never exposed.
    """
    try:
        if db is not None:
            return await db.reviews.find(
                {"visible": True, "rating": {"$gte": 4}}, {"_id": 0}
            ).sort("created_at", -1).to_list(500)
    except Exception as e:
        logger.error(f"DB Error fetching reviews: {e}")
    
    return []


# ── Business Info ──

async def get_business_info():
    """Return business info from DB, fall back to defaults."""
    try:
        if db is not None:
            info = await db.business_info.find_one({"id": "main"}, {"_id": 0})
            if info:
                return info
    except Exception as e:
        logger.error(f"DB Error fetching business info: {e}")
        
    return DEFAULT_BUSINESS_INFO


# ── Homepage ──

async def get_homepage_content():
    """Return homepage content from DB, fall back to defaults."""
    try:
        if db is not None:
            content = await db.homepage_content.find_one({"id": "main"}, {"_id": 0})
            if content:
                return content
    except Exception as e:
        logger.error(f"DB Error fetching homepage content: {e}")
        
    return DEFAULT_HOMEPAGE_CONTENT


# ── Blog ──

async def get_published_blogs():
    """Return published blog posts (without full content for listing)."""
    try:
        if db is not None:
            blogs = await db.blogs.find(
                {"published": True}, {"_id": 0, "content": 0}
            ).sort("date", -1).to_list(50)
            if blogs:
                return blogs
    except Exception as e:
        logger.error(f"DB Error fetching blogs: {e}")
        
    return [{k: v for k, v in b.items() if k != "content"} for b in BLOGS]


async def get_blog_by_slug(slug: str):
    """
    Find blog post by slug (includes full content).
    Flow: 1. Check DB  2. Check catalog  3. Return None
    """
    try:
        if db is not None:
            blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
            if blog:
                return blog
    except Exception as e:
        logger.error(f"DB Error fetching blog {slug}: {e}")

    for b in BLOGS:
        if b["slug"] == slug:
            return b
    return None


# ── Bookings ──

async def create_booking(payload: BookingCreate) -> Booking:
    """
    Create a new booking with server-side price validation.
    """
    quote = pricing_service.calculate_quote(
        selected_slugs=payload.services,
        pets=payload.pets,
        dates=payload.dates,
        options=payload.options
    )
    
    correct_price = quote["pay100"] if payload.payment_type == "100%" else quote["pay50"]
    
    # Validation: Ensure client-provided price matches server calculation
    if payload.estimated_price is not None:
        if abs(payload.estimated_price - correct_price) > 1:
            logger.warning(f"Price mismatch: Client sent {payload.estimated_price}, Server calc {correct_price}")
            # In production we might want to block this, but for now we'll just force the correct price
            # and log the warning.
    
    booking_data = payload.model_dump()
    booking_data["estimated_price"] = correct_price
    
    booking = Booking(**booking_data)
    
    if db is None:
        raise Exception("Database not available")
        
    await db.bookings.insert_one(booking.model_dump())
    try:
        send_email_notification(booking)  # 📧 Notify owner
    except Exception as e:
        logger.warning(f"Email notification failed (non-critical): {e}")
    return booking


async def get_booking_by_id(booking_id: str):
    """Retrieve a single booking by ID."""
    if db is None:
        return None
    return await db.bookings.find_one({"id": booking_id}, {"_id": 0})


# ── Contact ──

async def create_contact(payload: ContactCreate) -> Contact:
    """
    Save a contact form submission.
    """
    contact = Contact(**payload.model_dump())
    
    if db is None:
        raise Exception("Database not available")
        
    await db.contacts.insert_one(contact.model_dump())
    return contact
