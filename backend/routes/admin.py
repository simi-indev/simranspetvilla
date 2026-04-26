"""
Admin API routes — all require Bearer token auth.
Routes are THIN: auth check → call service → return/error.
All business logic lives in services/admin_service.py.
"""
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from typing import Optional

from auth import require_admin
from config import ADMIN_PASSWORD, ADMIN_TOKEN
from models import (
    AdminLogin, BookingStatusUpdate, ReviewCreate, ReviewUpdate,
    BusinessInfoUpdate, HomepageContentUpdate, ServiceUpdate,
    BlogCreate, BlogUpdate, ImageAssign,
)
from services import admin_service

router = APIRouter(prefix="/admin")


# ── Auth ──

@router.post("/login")
async def admin_login(payload: AdminLogin):
    # Flow: Check password → return token or 401
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"token": ADMIN_TOKEN}


# ── Stats ──

@router.get("/stats")
async def stats(_: bool = Depends(require_admin)):
    # Flow: Aggregate counts from all collections → return summary
    return await admin_service.get_dashboard_stats()


# ── Bookings ──

@router.get("/bookings")
async def list_bookings(status: Optional[str] = None, _: bool = Depends(require_admin)):
    # Flow: Optional status filter → query DB → return sorted list
    return await admin_service.list_bookings(status)


@router.patch("/bookings/{booking_id}")
async def update_booking(booking_id: str, payload: BookingStatusUpdate, _: bool = Depends(require_admin)):
    # Flow: 1. Validate status  2. Update in DB  3. Return updated booking
    # Future: Trigger WhatsApp notification on status change
    result, error = await admin_service.update_booking_status(booking_id, payload.status)
    if error:
        code = 400 if error == "Invalid status" else 404
        raise HTTPException(status_code=code, detail=error)
    return result


# ── Contacts ──

@router.get("/contacts")
async def list_contacts(_: bool = Depends(require_admin)):
    return await admin_service.list_contacts()


# ── Business Info ──

@router.put("/business-info")
async def update_business_info(payload: BusinessInfoUpdate, _: bool = Depends(require_admin)):
    # Flow: Filter non-null fields → upsert into DB → return updated doc
    result, error = await admin_service.update_business_info(payload.model_dump())
    if error:
        raise HTTPException(status_code=400, detail=error)
    return result


# ── Homepage Content ──

@router.put("/homepage-content")
async def update_homepage_content(payload: HomepageContentUpdate, _: bool = Depends(require_admin)):
    result, error = await admin_service.update_homepage_content(payload.model_dump())
    if error:
        raise HTTPException(status_code=400, detail=error)
    return result


# ── Services ──

@router.get("/services")
async def list_services(_: bool = Depends(require_admin)):
    return await admin_service.list_admin_services()


@router.put("/services/{slug}")
async def update_service(slug: str, payload: ServiceUpdate, _: bool = Depends(require_admin)):
    # Flow: Filter fields → update by slug → return or 404
    result, error = await admin_service.update_service(slug, payload.model_dump())
    if error:
        code = 400 if "No fields" in error else 404
        raise HTTPException(status_code=code, detail=error)
    return result


# ── Reviews ──

@router.get("/reviews")
async def list_reviews(_: bool = Depends(require_admin)):
    # Returns ALL reviews (including hidden) — admin sees everything
    return await admin_service.list_all_reviews()


@router.post("/reviews")
async def create_review(payload: ReviewCreate, _: bool = Depends(require_admin)):
    # Flow: Validate rating → create with ID + timestamp → return
    result, error = await admin_service.create_review(payload.model_dump())
    if error:
        raise HTTPException(status_code=400, detail=error)
    return result


@router.patch("/reviews/{review_id}")
async def update_review(review_id: str, payload: ReviewUpdate, _: bool = Depends(require_admin)):
    result, error = await admin_service.update_review(review_id, payload.model_dump())
    if error:
        code = 400 if "Rating" in error or "No fields" in error else 404
        raise HTTPException(status_code=code, detail=error)
    return result


@router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, _: bool = Depends(require_admin)):
    if not await admin_service.delete_review(review_id):
        raise HTTPException(status_code=404, detail="Review not found")
    return {"ok": True}


# ── Blog ──

@router.get("/blogs")
async def list_blogs(_: bool = Depends(require_admin)):
    return await admin_service.list_all_blogs()


@router.post("/blogs")
async def create_blog(payload: BlogCreate, _: bool = Depends(require_admin)):
    # Flow: Check slug unique → add timestamp → insert → return
    result, error = await admin_service.create_blog(payload.model_dump())
    if error:
        raise HTTPException(status_code=400, detail=error)
    return result


@router.put("/blogs/{slug}")
async def update_blog(slug: str, payload: BlogUpdate, _: bool = Depends(require_admin)):
    result, error = await admin_service.update_blog(slug, payload.model_dump())
    if error:
        code = 400 if "No fields" in error else 404
        raise HTTPException(status_code=code, detail=error)
    return result


@router.delete("/blogs/{slug}")
async def delete_blog(slug: str, _: bool = Depends(require_admin)):
    if not await admin_service.delete_blog(slug):
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"ok": True}


# ── Images ──

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), section: str = Form("gallery"), _: bool = Depends(require_admin)):
    # Flow: 1. Read file  2. Validate ext + size  3. Save to disk  4. Record in DB
    content = await file.read()
    result, error = await admin_service.upload_image(file.filename, content, section)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return result


@router.get("/images")
async def list_images(section: Optional[str] = None, _: bool = Depends(require_admin)):
    return await admin_service.list_images(section)


@router.patch("/images/{image_id}")
async def update_image(image_id: str, payload: ImageAssign, _: bool = Depends(require_admin)):
    result, error = await admin_service.update_image(image_id, payload.model_dump())
    if error:
        code = 400 if "No fields" in error else 404
        raise HTTPException(status_code=code, detail=error)
    return result


@router.delete("/images/{image_id}")
async def delete_image(image_id: str, _: bool = Depends(require_admin)):
    # Flow: 1. Find in DB  2. Delete file from disk  3. Remove from DB
    ok, error = await admin_service.delete_image(image_id)
    if not ok:
        raise HTTPException(status_code=404, detail=error)
    return {"ok": True}


# ── Google Review Sync ──

@router.post("/sync-google-reviews")
async def sync_google_reviews(_: bool = Depends(require_admin)):
    # Flow: 1. Check API configured  2. Fetch from Google  3. Deduplicate
    #       4. Insert new reviews as hidden  5. Return sync stats
    #       Admin approves new reviews manually
    result, error = await admin_service.sync_google_reviews()
    if error:
        raise HTTPException(status_code=500, detail=error)
    return result