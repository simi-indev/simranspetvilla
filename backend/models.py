"""
All Pydantic models for request/response validation.
One file, alphabetical by domain, easy to ctrl+F any model.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


# ── Admin ──
class AdminLogin(BaseModel):
    password: str


# ── Blog ──
class BlogCreate(BaseModel):
    slug: str
    title: str
    excerpt: str
    service: Optional[str] = None
    author: str = "Simran"
    date: str
    read_time: str = "5 min read"
    image: Optional[str] = None
    content: List[str] = []
    published: bool = True


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    service: Optional[str] = None
    author: Optional[str] = None
    date: Optional[str] = None
    read_time: Optional[str] = None
    image: Optional[str] = None
    content: Optional[List[str]] = None
    published: Optional[bool] = None


# ── Booking ──
class Pet(BaseModel):
    name: str
    species: str = "Dog"
    breed: Optional[str] = None
    age: Optional[str] = None
    weight: Optional[str] = None
    special_needs: Optional[str] = None
    vaccinated: bool = True


class Owner(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    locality: Optional[str] = None
    address: Optional[str] = None
    pickup_drop: bool = False


class BookingCreate(BaseModel):
    services: List[str]
    pet: Pet
    start_date: str
    end_date: Optional[str] = None
    time_slot: Optional[str] = None
    owner: Owner
    estimated_price: Optional[int] = None
    notes: Optional[str] = None


class Booking(BookingCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookingStatusUpdate(BaseModel):
    status: str


# ── Business Info ──
class BusinessInfoUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    hours: Optional[str] = None
    google_maps_url: Optional[str] = None
    google_review_url: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    founder_name: Optional[str] = None
    tags: Optional[List[str]] = None


# ── Contact ──
class ContactCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    message: str


class Contact(ContactCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    handled: bool = False


# ── Homepage ──
class HomepageContentUpdate(BaseModel):
    hero_headline: Optional[str] = None
    hero_subtext: Optional[str] = None
    hero_cta_primary: Optional[str] = None
    hero_cta_secondary: Optional[str] = None
    hero_image: Optional[str] = None
    how_it_works: Optional[List[Dict[str, Any]]] = None
    trust_bar_items: Optional[List[str]] = None


# ── Images ──
class ImageAssign(BaseModel):
    assigned_to: Optional[str] = None
    featured: Optional[bool] = None
    section: Optional[str] = None


# ── Reviews ──
class ReviewCreate(BaseModel):
    name: str
    pet: Optional[str] = None
    rating: int
    service: Optional[str] = None
    text: str
    visible: bool = True


class ReviewUpdate(BaseModel):
    name: Optional[str] = None
    pet: Optional[str] = None
    rating: Optional[int] = None
    service: Optional[str] = None
    text: Optional[str] = None
    visible: Optional[bool] = None


# ── Services ──
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    starting_price: Optional[int] = None
    max_price: Optional[int] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    includes: Optional[List[str]] = None
    faqs: Optional[List[Dict[str, str]]] = None
    image: Optional[str] = None


# ── Quote ──
class QuoteRequest(BaseModel):
    selectedSlugs: List[str]
    pets: List[Dict[str, Any]]
    dates: Dict[str, Any]
    options: Dict[str, Any]