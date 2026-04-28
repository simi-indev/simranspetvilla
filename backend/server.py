"""
Simran's PetVilla API — Application entry point.

This file does ONE thing: wire everything together.
- Config: config.py
- Models: models.py
- Auth: auth.py
- Business logic: services/
- Routes: routes/
- Seed data: seed.py

Run: uvicorn server:app --reload --port 8000
"""
import logging
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import client, STATIC_DIR, CORS_ALLOWED_ORIGINS
from seed import seed_data
from routes import public, admin

app = FastAPI(title="Simran's PetVilla API")

# Static files (uploaded images)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Routes — public + admin under /api prefix
api = APIRouter(prefix="/api")
api.include_router(public.router)
api.include_router(admin.router)
app.include_router(api)

# Lifecycle
app.on_event("startup")(seed_data)
app.on_event("shutdown")(lambda: client.close())

# CORS
app.add_middleware(
    CORSMiddleware, 
    allow_credentials=True, 
    allow_origins=CORS_ALLOWED_ORIGINS, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")