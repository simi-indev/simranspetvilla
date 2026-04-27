"""
Public-facing business logic.
Called by routes/public.py — routes stay thin, logic lives here.
"""
from config import db
from models import Booking, BookingCreate, Contact, ContactCreate
from data.defaults import DEFAULT_BUSINESS_INFO, DEFAULT_HOMEPAGE_CONTENT
from data.services import SERVICES
from data.blogs import BLOGS
from services import pricing_service


# ── Services ──

async def get_all_services():
    """Return services from DB, fall back to catalog if DB empty."""
    services = await db.services.find({}, {"_id": 0}).to_list(50)
    return services if services else SERVICES


async def get_service_by_slug(slug: str):
    """
    Find a single service by slug.
    Flow: 1. Check DB  2. Check catalog  3. Return None if not found
    """
    service = await db.services.find_one({"slug": slug}, {"_id": 0})
    if service:
        return service
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
    return await db.reviews.find(
        {"visible": True, "rating": {"$gte": 4}}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)


# ── Business Info ──

async def get_business_info():
    """Return business info from DB, fall back to defaults."""
    info = await db.business_info.find_one({"id": "main"}, {"_id": 0})
    return info or DEFAULT_BUSINESS_INFO


# ── Homepage ──

async def get_homepage_content():
    """Return homepage content from DB, fall back to defaults."""
    content = await db.homepage_content.find_one({"id": "main"}, {"_id": 0})
    return content or DEFAULT_HOMEPAGE_CONTENT


# ── Blog ──

async def get_published_blogs():
    """Return published blog posts (without full content for listing)."""
    blogs = await db.blogs.find(
        {"published": True}, {"_id": 0, "content": 0}
    ).sort("date", -1).to_list(50)
    if blogs:
        return blogs
    return [{k: v for k, v in b.items() if k != "content"} for b in BLOGS]


async def get_blog_by_slug(slug: str):
    """
    Find blog post by slug (includes full content).
    Flow: 1. Check DB  2. Check catalog  3. Return None
    """
    blog = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if blog:
        return blog
    for b in BLOGS:
        if b["slug"] == slug:
            return b
    return None


# ── Bookings ──

async def create_booking(payload: BookingCreate) -> Booking:
    """
    Create a new booking.
    Flow: 1. Server-side price calculation (prevents spoofing)
          2. Build booking with auto-generated ID + timestamp
          3. Save to MongoDB
          4. Return booking object
    """
    # 1. Recalculate price server-side
    quote = pricing_service.calculate_quote(
        selected_slugs=payload.services,
        pets=payload.pets,
        dates=payload.dates,
        options=payload.options
    )
    
    # 2. Determine correct price based on payment type (50% or 100%)
    correct_price = quote["pay100"] if payload.payment_type == "100%" else quote["pay50"]
    
    # 3. Create booking dict and override price
    booking_data = payload.model_dump()
    booking_data["estimated_price"] = correct_price
    
    booking = Booking(**booking_data)
    await db.bookings.insert_one(booking.model_dump())
    return booking


async def get_booking_by_id(booking_id: str):
    """Retrieve a single booking by ID."""
    return await db.bookings.find_one({"id": booking_id}, {"_id": 0})


# ── Contact ──

async def create_contact(payload: ContactCreate) -> Contact:
    """
    Save a contact form submission.
    Flow: 1. Build contact with auto-generated ID + timestamp
          2. Save to MongoDB
          3. Return contact object
    Future: Send notification to admin, auto-reply email
    """
    contact = Contact(**payload.model_dump())
    await db.contacts.insert_one(contact.model_dump())
    return contact