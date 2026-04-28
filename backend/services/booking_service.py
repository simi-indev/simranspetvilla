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
