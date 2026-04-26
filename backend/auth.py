"""Admin authentication dependency."""
from fastapi import Header, HTTPException
from typing import Optional
from config import ADMIN_TOKEN


def require_admin(authorization: Optional[str] = Header(None)):
    """FastAPI dependency — validates Bearer token for admin routes."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin access required")
    token = authorization.replace("Bearer ", "").strip()
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True