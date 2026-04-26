"""
Admin business logic.
Called by routes/admin.py — routes stay thin, logic lives here.
"""
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import uuid

from config import db, UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE, GOOGLE_PLACE_ID, GOOGLE_PLACES_API_KEY
from data.services import SERVICES


# ── Stats ──

async def get_dashboard_stats() -> dict:
    """
    Aggregate dashboard statistics.
    Flow: 1. Count bookings by status  2. Count contacts  3. Count reviews
    """
    return {
        "total_bookings": await db.bookings.count_documents({}),
        "new": await db.bookings.count_documents({"status": "new"}),
        "confirmed": await db.bookings.count_documents({"status": "confirmed"}),
        "completed": await db.bookings.count_documents({"status": "completed"}),
        "cancelled": await db.bookings.count_documents({"status": "cancelled"}),
        "contacts": await db.contacts.count_documents({}),
        "reviews_total": await db.reviews.count_documents({}),
        "reviews_visible": await db.reviews.count_documents({"visible": True, "rating": {"$gte": 4}}),
    }


# ── Bookings ──

async def list_bookings(status: Optional[str] = None):
    query = {"status": status} if status else {}
    return await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)


async def update_booking_status(booking_id: str, status: str):
    """
    Flow: 1. Validate status  2. Update in DB  3. Return updated booking or None
    Future: Trigger WhatsApp notification on status change
    """
    VALID = {"new", "confirmed", "completed", "cancelled"}
    if status not in VALID:
        return None, "Invalid status"
    res = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        return None, "Booking not found"
    return await db.bookings.find_one({"id": booking_id}, {"_id": 0}), None


# ── Contacts ──

async def list_contacts():
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


# ── Business Info ──

async def update_business_info(update: dict):
    """
    Flow: 1. Filter out None values  2. Upsert into MongoDB  3. Return updated doc
    """
    filtered = {k: v for k, v in update.items() if v is not None}
    if not filtered:
        return None, "No fields to update"
    await db.business_info.update_one({"id": "main"}, {"$set": filtered}, upsert=True)
    return await db.business_info.find_one({"id": "main"}, {"_id": 0}), None


# ── Homepage Content ──

async def update_homepage_content(update: dict):
    filtered = {k: v for k, v in update.items() if v is not None}
    if not filtered:
        return None, "No fields to update"
    await db.homepage_content.update_one({"id": "main"}, {"$set": filtered}, upsert=True)
    return await db.homepage_content.find_one({"id": "main"}, {"_id": 0}), None


# ── Services ──

async def list_admin_services():
    services = await db.services.find({}, {"_id": 0}).to_list(50)
    return services if services else SERVICES


async def update_service(slug: str, update: dict):
    """
    Flow: 1. Filter None values  2. Update by slug  3. Return updated or error
    """
    filtered = {k: v for k, v in update.items() if v is not None}
    if not filtered:
        return None, "No fields to update"
    res = await db.services.update_one({"slug": slug}, {"$set": filtered})
    if res.matched_count == 0:
        return None, "Service not found"
    return await db.services.find_one({"slug": slug}, {"_id": 0}), None


# ── Reviews ──

async def list_all_reviews():
    return await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


async def create_review(data: dict):
    """
    Flow: 1. Validate rating 1-5  2. Build doc with ID + timestamp  3. Insert
    """
    if data.get("rating", 0) < 1 or data.get("rating", 0) > 5:
        return None, "Rating must be 1-5"
    review = {
        "id": str(uuid.uuid4()),
        **data,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reviews.insert_one(review.copy())
    return {k: v for k, v in review.items() if k != "_id"}, None


async def update_review(review_id: str, update: dict):
    filtered = {k: v for k, v in update.items() if v is not None}
    if not filtered:
        return None, "No fields to update"
    if "rating" in filtered and (filtered["rating"] < 1 or filtered["rating"] > 5):
        return None, "Rating must be 1-5"
    res = await db.reviews.update_one({"id": review_id}, {"$set": filtered})
    if res.matched_count == 0:
        return None, "Review not found"
    return await db.reviews.find_one({"id": review_id}, {"_id": 0}), None


async def delete_review(review_id: str):
    res = await db.reviews.delete_one({"id": review_id})
    return res.deleted_count > 0


# ── Blog ──

async def list_all_blogs():
    return await db.blogs.find({}, {"_id": 0}).sort("date", -1).to_list(100)


async def create_blog(data: dict):
    """
    Flow: 1. Check slug uniqueness  2. Add timestamp  3. Insert
    """
    if await db.blogs.find_one({"slug": data["slug"]}):
        return None, "Blog with this slug already exists"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.blogs.insert_one(data)
    return {k: v for k, v in data.items() if k != "_id"}, None


async def update_blog(slug: str, update: dict):
    filtered = {k: v for k, v in update.items() if v is not None}
    if not filtered:
        return None, "No fields to update"
    res = await db.blogs.update_one({"slug": slug}, {"$set": filtered})
    if res.matched_count == 0:
        return None, "Blog post not found"
    return await db.blogs.find_one({"slug": slug}, {"_id": 0}), None


async def delete_blog(slug: str):
    res = await db.blogs.delete_one({"slug": slug})
    return res.deleted_count > 0


# ── Image Upload ──

async def upload_image(filename: str, content: bytes, section: str):
    """
    Flow: 1. Validate extension + size
          2. Save to disk at static/uploads/{section}/
          3. Record metadata in MongoDB
          4. Return image doc with URL
    """
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return None, "File type not allowed. Use jpg, png, webp, gif."
    if len(content) > MAX_FILE_SIZE:
        return None, "File too large. Max 10MB."

    section_dir = UPLOAD_DIR / section
    section_dir.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    (section_dir / unique_name).write_bytes(content)

    image_doc = {
        "id": str(uuid.uuid4()),
        "filename": unique_name,
        "original_name": filename,
        "url": f"/static/uploads/{section}/{unique_name}",
        "section": section,
        "assigned_to": None,
        "featured": False,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.images.insert_one(image_doc.copy())
    return {k: v for k, v in image_doc.items() if k != "_id"}, None


async def list_images(section: Optional[str] = None):
    query = {"section": section} if section else {}
    return await db.images.find(query, {"_id": 0}).sort("uploaded_at", -1).to_list(500)


async def update_image(image_id: str, update: dict):
    filtered = {k: v for k, v in update.items() if v is not None}
    if not filtered:
        return None, "No fields to update"
    res = await db.images.update_one({"id": image_id}, {"$set": filtered})
    if res.matched_count == 0:
        return None, "Image not found"
    return await db.images.find_one({"id": image_id}, {"_id": 0}), None


async def delete_image(image_id: str):
    """
    Flow: 1. Find image in DB  2. Delete file from disk  3. Remove from DB
    """
    img = await db.images.find_one({"id": image_id})
    if not img:
        return False, "Image not found"
    file_path = UPLOAD_DIR / img["section"] / img["filename"]
    if file_path.exists():
        file_path.unlink()
    await db.images.delete_one({"id": image_id})
    return True, None


# ── Google Review Sync ──

async def sync_google_reviews():
    """
    Flow: 1. Check if API configured  2. Fetch from Google Places API
          3. Deduplicate by google_review_id  4. Insert new reviews as hidden
          5. Return sync stats
    Admin approves new reviews manually via visibility toggle.
    """
    if not GOOGLE_PLACE_ID or not GOOGLE_PLACES_API_KEY:
        return {
            "configured": False,
            "error": "Google Places API not configured",
            "setup_instructions": "Add GOOGLE_PLACE_ID and GOOGLE_PLACES_API_KEY to .env",
        }

    import urllib.request
    import json as _json

    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={GOOGLE_PLACE_ID}&fields=reviews&key={GOOGLE_PLACES_API_KEY}"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = _json.loads(resp.read())
    except Exception as e:
        return None, f"Google API request failed: {str(e)}"

    if data.get("status") != "OK":
        return None, f"Google API error: {data.get('status')} — {data.get('error_message', '')}"

    google_reviews = data.get("result", {}).get("reviews", [])
    new_count = 0
    for gr in google_reviews:
        google_id = f"google_{gr.get('time', '')}_{gr.get('author_name', '').replace(' ', '_')}"
        if not await db.reviews.find_one({"google_review_id": google_id}):
            await db.reviews.insert_one({
                "id": str(uuid.uuid4()),
                "google_review_id": google_id,
                "name": gr.get("author_name", "Anonymous"),
                "pet": None,
                "rating": gr.get("rating", 5),
                "service": None,
                "text": gr.get("text", ""),
                "visible": False,
                "source": "google",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            new_count += 1

    return {
        "configured": True,
        "synced": len(google_reviews),
        "new": new_count,
        "already_existed": len(google_reviews) - new_count,
    }, None