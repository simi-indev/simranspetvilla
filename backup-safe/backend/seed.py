"""
Seed MongoDB collections on first startup.
Only inserts if collections are empty — safe to run repeatedly.
"""
from datetime import datetime, timezone
from config import db
from data.defaults import DEFAULT_BUSINESS_INFO, DEFAULT_REVIEWS, DEFAULT_HOMEPAGE_CONTENT
from data.services import SERVICES
from data.blogs import BLOGS


async def seed_data():
    if db is None:
        print("MongoDB unavailable, skipping seed data.")
        return
    """Populate empty collections with default data."""

    if not await db.business_info.find_one({"id": "main"}):
        await db.business_info.insert_one(DEFAULT_BUSINESS_INFO.copy())

    if await db.reviews.count_documents({}) == 0:
        for r in DEFAULT_REVIEWS:
            doc = {**r, "created_at": datetime.now(timezone.utc).isoformat()}
            await db.reviews.insert_one(doc)

    if await db.services.count_documents({}) == 0:
        for s in SERVICES:
            await db.services.insert_one(s.copy())

    if await db.blogs.count_documents({}) == 0:
        for b in BLOGS:
            doc = {**b, "created_at": datetime.now(timezone.utc).isoformat()}
            await db.blogs.insert_one(doc)

    if not await db.homepage_content.find_one({"id": "main"}):
        await db.homepage_content.insert_one(DEFAULT_HOMEPAGE_CONTENT.copy())