from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'petvilla2026')
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'pv-admin-secret-token-2026')

app = FastAPI(title="Simran's PetVilla API")
api_router = APIRouter(prefix="/api")


# ---------------------------- Models ----------------------------
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
    services: List[str]  # list of service slugs
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
    status: str = "new"  # new | confirmed | completed | cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookingStatusUpdate(BaseModel):
    status: str


class ContactCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    message: str


class Contact(ContactCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    handled: bool = False


class AdminLogin(BaseModel):
    password: str


# ---------------------------- Static Catalog Data ----------------------------
SERVICES = [
    {
        "slug": "pet-boarding",
        "name": "Pet Boarding",
        "tagline": "Cage-free, home-style overnight stays",
        "icon": "Home",
        "starting_price": 499,
        "max_price": 699,
        "unit": "night",
        "description": "Your pet sleeps in a real home, plays freely with other friendly pets, and gets the love they deserve while you travel.",
        "includes": [
            "Cage-free home environment",
            "3 meals + treats daily",
            "Daily walks & playtime",
            "Photo & video updates on WhatsApp",
            "24/7 supervised care",
            "Vet on call for emergencies",
        ],
        "image": "https://images.unsplash.com/photo-1601880348117-25c1127a95df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxkb2clMjBzbGVlcHxlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
        "faqs": [
            {"q": "Is the facility really cage-free?", "a": "Yes, 100%. Pets stay in our home with us, sleep on dog beds in shared rooms, and have free run of indoor and outdoor play areas."},
            {"q": "What if my pet is anxious?", "a": "We schedule a complimentary 30-minute meet-and-greet before the first booking so your pet (and you) feel comfortable."},
            {"q": "Do you accept all breeds?", "a": "We accept friendly, vaccinated dogs and cats of all breeds. Aggressive pets are evaluated case-by-case for the safety of all guests."},
            {"q": "Is pickup and drop available?", "a": "Yes — pickup and drop is available within Pune at an extra ₹150–300 depending on your locality."},
            {"q": "What vaccinations are required?", "a": "Dogs: DHPPiL + Rabies (annual). Cats: FVRCP + Rabies. Vaccination certificate must be shared at booking."},
        ],
    },
    {
        "slug": "pet-daycare",
        "name": "Pet Daycare",
        "tagline": "A second home while you're at work",
        "icon": "Sun",
        "starting_price": 299,
        "max_price": 399,
        "unit": "day",
        "description": "Working long hours? Drop your pet for the day. They'll play, nap, eat, and come home tired and happy.",
        "includes": [
            "8–10 hours supervised care",
            "Lunch + snacks included",
            "Indoor + outdoor play",
            "Socialisation with other pets",
            "Photo updates throughout the day",
            "Optional pickup/drop",
        ],
        "image": "https://images.pexels.com/photos/13923477/pexels-photo-13923477.jpeg",
        "faqs": [
            {"q": "What are daycare hours?", "a": "Daycare runs 8 AM to 8 PM. Drop-off and pick-up windows are flexible by 30 minutes."},
            {"q": "Do you offer weekly packages?", "a": "Yes — book 5 days in a week and pay for 4. Monthly packages save up to 25%."},
            {"q": "What if my pet doesn't like other dogs?", "a": "We have separate quiet zones for shy or older pets. Socialisation is optional, never forced."},
            {"q": "Can I drop my pet last minute?", "a": "Same-day daycare is possible if we have space — message us on WhatsApp by 9 AM."},
        ],
    },
    {
        "slug": "home-grooming",
        "name": "Home Grooming",
        "tagline": "Stress-free grooming at your doorstep",
        "icon": "Scissors",
        "starting_price": 499,
        "max_price": 799,
        "unit": "session",
        "description": "Our professional groomer comes to your home with all equipment. No stressful car rides, no waiting rooms — just a happy, clean pet.",
        "includes": [
            "Bath with hypoallergenic shampoo",
            "Hair trimming & styling",
            "Nail clipping",
            "Ear cleaning",
            "Brushing & de-shedding",
            "All equipment provided",
        ],
        "image": "https://images.pexels.com/photos/6131576/pexels-photo-6131576.jpeg",
        "faqs": [
            {"q": "How long does a grooming session take?", "a": "Typically 60–90 minutes depending on coat type and pet size."},
            {"q": "Do I need to provide anything?", "a": "Nothing! We bring shampoo, towels, dryer, clippers — everything. Just provide a power point and a bathroom or balcony."},
            {"q": "Can you handle aggressive dogs?", "a": "Our groomer is experienced with reactive pets, but we may decline if safety is a concern. Free re-assessment available."},
            {"q": "How often should I groom my dog?", "a": "Most breeds: every 4–6 weeks. Long-coated breeds (Shih Tzu, Lhasa): every 3–4 weeks."},
        ],
    },
    {
        "slug": "pet-sitting",
        "name": "Pet Sitting",
        "tagline": "Loving care, in your own home",
        "icon": "Heart",
        "starting_price": 299,
        "max_price": 499,
        "unit": "visit",
        "description": "We visit your home to feed, walk, and spend time with your pet — perfect for anxious pets who prefer their own bed.",
        "includes": [
            "30–60 min home visit",
            "Feeding & fresh water",
            "Walk + play time",
            "Litter box / poop cleanup",
            "Photo & video update each visit",
            "Plant watering on request",
        ],
        "image": "https://images.pexels.com/photos/35133324/pexels-photo-35133324.jpeg",
        "faqs": [
            {"q": "How many visits per day?", "a": "Most owners book 2 visits/day (morning + evening). Cats often only need 1. Overnight sitting is also available."},
            {"q": "Are you bonded/insured?", "a": "We carry pet care liability cover. Keys are handled with photo ID verification and never duplicated."},
            {"q": "What if my pet has medication?", "a": "We can administer oral, topical, and injection-based medication. Just walk us through the routine at the meet-and-greet."},
            {"q": "Do you cover all of Pune?", "a": "Primary coverage: Lohegaon, Dhanori, Viman Nagar, Kharadi, Kalyani Nagar, Koregaon Park, Wagholi. Other areas — message us."},
        ],
    },
    {
        "slug": "pet-food-delivery",
        "name": "Home-Cooked Food Delivery",
        "tagline": "Fresh, vet-approved meals to your door",
        "icon": "UtensilsCrossed",
        "starting_price": 199,
        "max_price": 349,
        "unit": "day",
        "description": "Real chicken, real rice, real vegetables. No preservatives. Cooked daily and delivered fresh — your dog will literally lick the bowl.",
        "includes": [
            "Vet-approved recipes",
            "Customised by breed & age",
            "Zero preservatives or artificial colours",
            "Weekly subscription plans",
            "Free delivery in primary zones",
            "Pause or cancel anytime",
        ],
        "image": "https://images.pexels.com/photos/8434635/pexels-photo-8434635.jpeg",
        "faqs": [
            {"q": "Is it really cooked daily?", "a": "Yes — meals are cooked each morning and delivered the same day. Nothing sits in storage longer than 24 hours."},
            {"q": "Is the food vet-approved?", "a": "Yes, all recipes are reviewed by Dr. Anjali Sharma, BVSc. (Pune). Macros and micros are balanced per breed."},
            {"q": "Can I try before subscribing?", "a": "Absolutely — first 3 days at ₹99/day. If your dog doesn't love it, we refund."},
            {"q": "What about allergies?", "a": "We offer single-protein recipes (chicken-only, fish-only, lamb-only) for sensitive dogs. Just tell us at signup."},
        ],
    },
    {
        "slug": "pet-training",
        "name": "Pet Training",
        "tagline": "Calm, confident, well-behaved pets",
        "icon": "GraduationCap",
        "starting_price": 599,
        "max_price": 799,
        "unit": "session",
        "description": "Positive-reinforcement training for puppies and adults. Basic obedience, leash manners, anxiety handling, and behaviour correction.",
        "includes": [
            "Certified positive-reinforcement trainer",
            "Customised training plan",
            "Group or 1-on-1 sessions",
            "Owner included in every session",
            "Weekly progress reports",
            "Lifetime support on WhatsApp",
        ],
        "image": "https://images.pexels.com/photos/32186519/pexels-photo-32186519.jpeg",
        "faqs": [
            {"q": "What age can my puppy start?", "a": "We start as early as 8 weeks (after first vaccination). Earlier is better for socialisation."},
            {"q": "How many sessions will I need?", "a": "Basic obedience: 8 sessions. Behaviour correction (anxiety, aggression): 10–12 sessions."},
            {"q": "Do you offer packages?", "a": "Yes — 8-session package at ₹4,799 (save ₹1,200) and 10-session package at ₹5,999 (save ₹1,991)."},
            {"q": "Where do training sessions happen?", "a": "Either at our facility (preferred for group sessions) or at your home (preferred for behaviour issues)."},
        ],
    },
]

REVIEWS = [
    {"id": "r1", "name": "Anjali Mehta", "pet": "Bruno (Labrador)", "rating": 5, "service": "Pet Boarding", "text": "Left Bruno for 8 days while we were in Goa. He came back happier than when we dropped him off. The video updates every day were honestly the best part — Simran genuinely loves these dogs."},
    {"id": "r2", "name": "Rohan Kapoor", "pet": "Misha (Persian Cat)", "rating": 5, "service": "Pet Sitting", "text": "Misha is a grumpy cat. Most sitters give up. Simran's team did 2 visits a day for 12 days and she warmed up to them by day 3. Coming home to a happy cat is priceless."},
    {"id": "r3", "name": "Priya Iyer", "pet": "Coco (Shih Tzu)", "rating": 5, "service": "Home Grooming", "text": "Coco hates the parlour — howls in the car. Home grooming changed everything. The groomer was patient, gentle, and Coco actually came out wagging her tail. Booking weekly now."},
    {"id": "r4", "name": "Karan Verma", "pet": "Max (Golden Retriever)", "rating": 4, "service": "Pet Daycare", "text": "Max goes 3 times a week while I'm at office. He's social, tired, and well-fed when I pick him up. Pricing is fair, communication is super prompt on WhatsApp."},
    {"id": "r5", "name": "Neha Sharma", "pet": "Bella (Beagle)", "rating": 5, "service": "Pet Training", "text": "Bella was pulling on the leash, barking at every stranger, jumping on guests. After 8 sessions she's a different dog. Trainer is calm, patient, and the methods actually work."},
    {"id": "r6", "name": "Sandeep Gupta", "pet": "Rocky (Indie)", "rating": 5, "service": "Food Delivery", "text": "Switched Rocky off kibble 6 months ago. His coat is shinier, his energy is up, and our vet said his last bloodwork is the best it's ever been. Worth every rupee."},
]

BLOGS = [
    {
        "slug": "how-to-choose-pet-boarding-pune-2026",
        "title": "How to choose a pet boarding in Pune (2026 guide)",
        "excerpt": "Not all pet boardings are equal. Here are the 7 things every Pune pet parent should check before leaving their dog or cat.",
        "service": "pet-boarding",
        "author": "Simran",
        "date": "2026-01-15",
        "read_time": "6 min read",
        "image": "https://images.unsplash.com/photo-1601880348117-25c1127a95df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxkb2clMjBzbGVlcHxlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
        "content": [
            "Choosing a pet boarding in Pune is more than picking the cheapest or closest option. Your dog or cat is family — and where they sleep when you're away matters.",
            "## 1. Cage-free vs cage-based",
            "Cage-based boardings can stack 30+ pets in a small room. Cage-free home boardings keep the count low (5–8 pets) and let them roam freely. Less stress, fewer fights, better sleep.",
            "## 2. Visit before you book",
            "Any genuine boarding will let you visit before your booking. Walk in, see the sleeping area, smell the rooms (it should smell like dogs and cleaner — not urine), and meet the people who will care for your pet.",
            "## 3. Ask about the daily routine",
            "When are meals served? When are walks? When is play time? A clear routine means a calm pet. Vague answers mean chaos.",
            "## 4. Vaccination requirements",
            "Reputable boardings ask for current DHPPiL + Rabies (dogs) or FVRCP + Rabies (cats). If they don't ask, that means other pets aren't checked either — and that's a risk.",
            "## 5. Updates while you're away",
            "WhatsApp photo and video updates are now standard. If a boarding can't send a daily photo, that's a red flag.",
            "## 6. What happens in an emergency",
            "Ask: 'If my pet has a vet emergency at 10 PM, what do you do?' The answer should be specific — a named vet, a phone number, a transport plan.",
            "## 7. Reviews — Google, not Instagram",
            "Instagram is curated. Google reviews are real. Look for 50+ reviews, recent dates, and how the boarding responds to negative ones.",
            "At Simran's PetVilla we welcome a free pre-booking visit. Message us on WhatsApp to schedule yours.",
        ],
    },
    {
        "slug": "cage-free-vs-cage-boarding",
        "title": "Cage-free vs cage boarding: which is better for your dog?",
        "excerpt": "The honest answer depends on your dog. Here's a no-nonsense comparison from a boarding owner.",
        "service": "pet-boarding",
        "author": "Simran",
        "date": "2026-01-08",
        "read_time": "5 min read",
        "image": "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
        "content": [
            "Walk into any pet boarding in India and you'll see two distinct philosophies: cage-based and cage-free. Both have their place. Here's how to decide.",
            "## Cage-based boarding",
            "Each pet has a dedicated kennel (typically 3x3 feet for small dogs, 4x6 for large). Pets are let out a few times a day for walks and play. Often used by chains because it scales easily.",
            "**Best for:** older pets, anxious pets, pets who don't socialise, post-surgery recovery.",
            "## Cage-free boarding",
            "All pets share common indoor and outdoor areas. They sleep on dog beds in shared rooms (smaller bedrooms with 4–6 beds). Far more social interaction.",
            "**Best for:** confident, social pets who thrive around other dogs.",
            "## What we offer",
            "Simran's PetVilla is 100% cage-free. We accept up to 8 pets at a time, all carefully matched for temperament. If your pet would do better with a quieter space, we'll be honest with you.",
        ],
    },
    {
        "slug": "home-cooked-food-for-dogs-benefits",
        "title": "Home-cooked food for dogs: benefits and recipes",
        "excerpt": "Why home-cooked beats kibble — and 3 vet-approved recipes you can try this week.",
        "service": "pet-food-delivery",
        "author": "Dr. Anjali Sharma",
        "date": "2026-01-02",
        "read_time": "8 min read",
        "image": "https://images.pexels.com/photos/8434635/pexels-photo-8434635.jpeg",
        "content": [
            "Most commercial kibble is 60% grain filler. Real, fresh, home-cooked food can transform your dog's coat, energy, digestion, and longevity. Here's the why and the how.",
            "## Why home-cooked",
            "Bioavailable protein, real moisture, no preservatives, no artificial colours, no mystery 'meat meal'. You see exactly what goes in.",
            "## The 70-20-10 rule",
            "70% protein (chicken, fish, lamb, eggs), 20% vegetables (carrot, beans, pumpkin, spinach), 10% complex carbs (rice, oats, quinoa). Adjust for activity level.",
            "## Recipe 1 — Chicken & Rice (everyday)",
            "Boil 200g boneless chicken with 1 cup rice and ½ cup mixed veg (carrot, beans, peas). No salt, no oil. Cool and serve. Feeds a 15kg dog for one day.",
            "## Recipe 2 — Fish & Quinoa (skin/coat)",
            "Steam 200g rohu or salmon fish with ¾ cup quinoa and 1 boiled egg. Add a teaspoon of fish oil. Excellent for coat and joint health.",
            "## Recipe 3 — Lamb & Pumpkin (sensitive stomach)",
            "Slow-cook 200g minced lamb with ½ cup pumpkin and ½ cup oats. Easy on digestion, hypoallergenic.",
            "## Don'ts",
            "No onion, no garlic, no chocolate, no grapes, no raw bones, no salt. Always cook protein fully (no raw chicken).",
            "Want this delivered fresh, daily, customised for your dog? Check our food delivery service.",
        ],
    },
    {
        "slug": "dog-grooming-at-home-vs-parlour",
        "title": "Dog grooming at home vs parlour — which is less stressful?",
        "excerpt": "If your dog dreads the parlour, you're not alone. Here's what home grooming actually looks like.",
        "service": "home-grooming",
        "author": "Simran",
        "date": "2025-12-28",
        "read_time": "4 min read",
        "image": "https://images.pexels.com/photos/6131576/pexels-photo-6131576.jpeg",
        "content": [
            "If you've ever dragged a howling dog into a parlour, you know — grooming can be traumatic. Home grooming is changing that.",
            "## The parlour experience",
            "Strange place, strange smells, other barking dogs, blow dryers everywhere, long waits. Most dogs experience this as a high-stress event.",
            "## The home experience",
            "Familiar smells, familiar sofa, no other dogs barking, no waiting. The groomer adapts to your dog — not the other way around.",
            "## Cost comparison",
            "Parlour: ₹600–1,200 + travel + your time. Home: ₹499–799 all-in. Often cheaper when you factor in travel.",
            "## Quality",
            "A good home groomer brings the same equipment as a parlour. The only thing missing is the stress.",
        ],
    },
    {
        "slug": "how-to-prepare-dog-for-training",
        "title": "How to prepare your dog for training (beginner's guide)",
        "excerpt": "Before the first session: 5 things every owner should do to set their dog up for success.",
        "service": "pet-training",
        "author": "Simran",
        "date": "2025-12-20",
        "read_time": "5 min read",
        "image": "https://images.pexels.com/photos/32186519/pexels-photo-32186519.jpeg",
        "content": [
            "Training works best when the dog is rested, hungry (for treats), and the environment is calm. Here's how to prep.",
            "## 1. Pick the right time of day",
            "Right after a long walk, before meals. A tired-but-not-exhausted, hungry dog will work hardest for treats.",
            "## 2. Use small, smelly treats",
            "Boiled chicken cut to pea-sized pieces beats commercial treats. The smaller the piece, the more reps you get.",
            "## 3. Start in a quiet room",
            "First sessions: indoor, no distractions. Once the command is solid, slowly add distractions (other rooms, garden, then street).",
            "## 4. Sessions should be short",
            "5–10 minutes max for puppies. 15 minutes for adults. Always end on a success.",
            "## 5. Be consistent with your words",
            "Pick one word per command (sit, down, come) and use it the same way every time. Mixed signals confuse dogs.",
            "Want a structured 8-session plan with a certified trainer? Check our training service.",
        ],
    },
    {
        "slug": "why-your-dog-needs-daycare",
        "title": "Working from office? Why your dog needs daycare",
        "excerpt": "Eight hours alone is too long for any dog. Here's what daycare solves — and what it doesn't.",
        "service": "pet-daycare",
        "author": "Simran",
        "date": "2025-12-12",
        "read_time": "4 min read",
        "image": "https://images.pexels.com/photos/13923477/pexels-photo-13923477.jpeg",
        "content": [
            "If your dog is alone 9+ hours a day, you'll see it in the destroyed shoes, the constant whining, and the welcome-home zoomies that look more like desperation. Daycare fixes most of this.",
            "## What daycare gives your dog",
            "Socialisation, supervised play, regular meals, mental stimulation, no separation anxiety, and most importantly — a tired dog at the end of the day.",
            "## What it doesn't replace",
            "Your evening walks. Your bond. Your training time. Daycare is a supplement — not a substitute for owner-time.",
            "## Signs your dog needs daycare",
            "Destructive when alone, constant barking, weight gain, depression, separation anxiety. If any of these — daycare 2–3 days/week often resolves it within weeks.",
        ],
    },
]


# ---------------------------- Auth Helper ----------------------------
def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin access required")
    token = authorization.replace("Bearer ", "").strip()
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True


# ---------------------------- Routes ----------------------------
@api_router.get("/")
async def root():
    return {"message": "Simran's PetVilla API", "version": "1.0"}


# Services
@api_router.get("/services")
async def list_services():
    return SERVICES


@api_router.get("/services/{slug}")
async def get_service(slug: str):
    for s in SERVICES:
        if s["slug"] == slug:
            return s
    raise HTTPException(status_code=404, detail="Service not found")


# Reviews
@api_router.get("/reviews")
async def list_reviews():
    return REVIEWS


# Blog
@api_router.get("/blog")
async def list_blogs():
    return [{k: v for k, v in b.items() if k != "content"} for b in BLOGS]


@api_router.get("/blog/{slug}")
async def get_blog(slug: str):
    for b in BLOGS:
        if b["slug"] == slug:
            return b
    raise HTTPException(status_code=404, detail="Blog post not found")


# Bookings
@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    booking = Booking(**payload.model_dump())
    doc = booking.model_dump()
    await db.bookings.insert_one(doc)
    return booking


@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b


# Contact
@api_router.post("/contact", response_model=Contact)
async def create_contact(payload: ContactCreate):
    contact = Contact(**payload.model_dump())
    await db.contacts.insert_one(contact.model_dump())
    return contact


# ---------------------------- Admin Routes ----------------------------
@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"token": ADMIN_TOKEN}


@api_router.get("/admin/bookings")
async def admin_list_bookings(status: Optional[str] = None, _: bool = Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings


@api_router.patch("/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id: str, payload: BookingStatusUpdate, _: bool = Depends(require_admin)):
    valid_statuses = {"new", "confirmed", "completed", "cancelled"}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    return booking


@api_router.get("/admin/contacts")
async def admin_list_contacts(_: bool = Depends(require_admin)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return contacts


@api_router.get("/admin/stats")
async def admin_stats(_: bool = Depends(require_admin)):
    total = await db.bookings.count_documents({})
    new_count = await db.bookings.count_documents({"status": "new"})
    confirmed = await db.bookings.count_documents({"status": "confirmed"})
    completed = await db.bookings.count_documents({"status": "completed"})
    cancelled = await db.bookings.count_documents({"status": "cancelled"})
    contacts = await db.contacts.count_documents({})
    return {
        "total_bookings": total,
        "new": new_count,
        "confirmed": confirmed,
        "completed": completed,
        "cancelled": cancelled,
        "contacts": contacts,
    }


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
