"""
App configuration — env vars, DB connection, constants.
Single source of truth for all config values.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ── MongoDB ──
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "petvilla")

if MONGO_URL:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
else:
    print("WARNING: MONGO_URL not found. App will run in fallback mode (read-only for most routes).")
    client = None
    db = None

# ── Admin auth ──
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "petvilla2026")
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "pv-admin-secret-token-2026")
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "pv-dev-secret-key-change-in-prod")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_HOURS = 24

# ── Google Places (optional — degrades gracefully) ──
GOOGLE_PLACE_ID = os.environ.get("GOOGLE_PLACE_ID")
GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY")

# ── File uploads ──
STATIC_DIR = ROOT_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR = STATIC_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB