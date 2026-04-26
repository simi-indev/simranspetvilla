"""
Public API routes — no auth required.
Routes are THIN: validate input → call service → return response.
All business logic lives in services/booking_service.py.
"""
from fastapi import APIRouter, HTTPException
from models import BookingCreate, Booking, ContactCreate, Contact
from services import booking_service

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Simran's PetVilla API", "version": "2.0"}


# ── Services ──

@router.get("/services")
async def list_services():
    # Flow: Read from DB → fallback to catalog → return list
    return await booking_service.get_all_services()


@router.get("/services/{slug}")
async def get_service(slug: str):
    # Flow: Check DB → check catalog → 404 if not found
    service = await booking_service.get_service_by_slug(slug)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


# ── Reviews ──

@router.get("/reviews")
async def list_reviews():
    # Flow: Query DB for visible=true AND rating>=4 → return sorted by date
    return await booking_service.get_public_reviews()


# ── Business Info ──

@router.get("/business-info")
async def get_business_info():
    # Flow: Read from DB → fallback to defaults → return
    return await booking_service.get_business_info()


# ── Homepage Content ──

@router.get("/homepage-content")
async def get_homepage_content():
    # Flow: Read from DB → fallback to defaults → return
    return await booking_service.get_homepage_content()


# ── Blog ──

@router.get("/blog")
async def list_blogs():
    # Flow: Query DB for published=true (no content field) → fallback to catalog
    return await booking_service.get_published_blogs()


@router.get("/blog/{slug}")
async def get_blog(slug: str):
    # Flow: Check DB → check catalog → 404 if not found
    blog = await booking_service.get_blog_by_slug(slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog


# ── Bookings ──

@router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    # Flow: 1. Validate input (Pydantic)
    #       2. Create booking with auto ID + timestamp
    #       3. Save to MongoDB
    #       4. Return booking (frontend shows success + WhatsApp link)
    # Future: validate service slugs exist, calculate server-side pricing
    return await booking_service.create_booking(payload)


@router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    # Flow: Find by ID → return or 404
    booking = await booking_service.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


# ── Contact ──

@router.post("/contact", response_model=Contact)
async def create_contact(payload: ContactCreate):
    # Flow: 1. Validate input  2. Save to MongoDB  3. Return
    # Future: Send WhatsApp notification to admin, auto-reply email
    return await booking_service.create_contact(payload)