"""Admin authentication dependency."""
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Header, HTTPException
from typing import Optional
from passlib.context import CryptContext
from config import (
    JWT_SECRET_KEY, 
    JWT_ALGORITHM, 
    JWT_ACCESS_TOKEN_EXPIRE_HOURS, 
    ADMIN_PASSWORD, 
    ADMIN_PASSWORD_HASH
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str) -> bool:
    """Verifies password against hash or fallback plaintext."""

    # 1. Try hash (preferred)
    if ADMIN_PASSWORD_HASH:
        try:
            return pwd_context.verify(plain_password, ADMIN_PASSWORD_HASH)
        except Exception:
            # hash is invalid → fallback
            pass

    # 2. Fallback to plaintext (STAGED DEPLOYMENT ONLY)
    # TODO: Remove this fallback once ADMIN_PASSWORD_HASH is configured in Render environment variables.
    if not ADMIN_PASSWORD:
        return False

    return plain_password == ADMIN_PASSWORD

def create_access_token() -> str:
    """Generates a JWT token for the admin."""
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": "admin", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def require_admin(authorization: Optional[str] = Header(None)):
    """FastAPI dependency — validates JWT Bearer token for admin routes."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin access required")
    
    token = authorization.replace("Bearer ", "").strip()
    
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("sub") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid admin token")
        
    return True
