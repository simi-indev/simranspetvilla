"""Default seed data — used for first-run seeding and fallback."""

DEFAULT_REVIEWS = [
    {"id": "r1", "name": "Anjali Mehta", "pet": "Bruno (Labrador)", "rating": 5, "service": "Pet Boarding", "text": "Left Bruno for 8 days while we were in Goa. He came back happier than when we dropped him off. The video updates every day were honestly the best part — Simran genuinely loves these dogs.", "visible": True},
    {"id": "r2", "name": "Rohan Kapoor", "pet": "Misha (Persian Cat)", "rating": 5, "service": "Pet Sitting", "text": "Misha is a grumpy cat. Most sitters give up. Simran's team did 2 visits a day for 12 days and she warmed up to them by day 3. Coming home to a happy cat is priceless.", "visible": True},
    {"id": "r3", "name": "Priya Iyer", "pet": "Coco (Shih Tzu)", "rating": 5, "service": "Home Grooming", "text": "Coco hates the parlour — howls in the car. Home grooming changed everything. The groomer was patient, gentle, and Coco actually came out wagging her tail. Booking weekly now.", "visible": True},
    {"id": "r4", "name": "Karan Verma", "pet": "Max (Golden Retriever)", "rating": 5, "service": "Pet Daycare", "text": "Max goes 3 times a week while I'm at office. He's social, tired, and well-fed when I pick him up. Pricing is fair, communication is super prompt on WhatsApp.", "visible": True},
    {"id": "r5", "name": "Neha Sharma", "pet": "Bella (Beagle)", "rating": 5, "service": "Pet Training", "text": "Bella was pulling on the leash, barking at every stranger, jumping on guests. After 8 sessions she's a different dog. Trainer is calm, patient, and the methods actually work.", "visible": True},
    {"id": "r6", "name": "Sandeep Gupta", "pet": "Rocky (Indie)", "rating": 5, "service": "Food Delivery", "text": "Switched Rocky off kibble 6 months ago. His coat is shinier, his energy is up, and our vet said his last bloodwork is the best it's ever been. Worth every rupee.", "visible": True},
]

DEFAULT_BUSINESS_INFO = {
    "id": "main",
    "name": "Simran's PetVilla",
    "tagline": "Your Pet's Second Home",
    "rating": 4.8,
    "review_count": 500,
    "phone_primary": "+91 99889 75056",
    "phone_secondary": "+91 77608 34823",
    "whatsapp_number": "919988975056",
    "email": "simran.kaurgill9@gmail.com",
    "address": "Suryasadan, Sr. No. 76/1/1, Sant Nagar, Lohegaon-Wagholi Road, Lane 9, near Indian Oil Petrol Pump, Lohegaon, Pune, Maharashtra 411047",
    "city": "Pune",
    "pincode": "411047",
    "hours": "Open 24 hours · 7 days a week",
    "google_maps_url": "https://maps.app.goo.gl/xQ543QJ34P9vnNRE9",
    "google_review_url": "https://maps.app.goo.gl/xQ543QJ34P9vnNRE9",
    "instagram_url": "https://instagram.com/simranspetvilla",
    "facebook_url": "https://facebook.com/simranspetvilla",
    "founder_name": "Simran Kaur Gill",
    "about_image": "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
    "tags": ["Cage-free", "Women-owned", "LGBTQ+ friendly", "24/7 care", "500+ happy pet parents"],
}

DEFAULT_HOMEPAGE_CONTENT = {
    "id": "main",
    "hero_headline": "Pune's Most Trusted Cage-Free Pet Care",
    "hero_subtext": "Boarding, grooming, daycare, training & home-cooked food — all with the warmth of a real home.",
    "hero_cta_primary": "Book a Service",
    "hero_cta_secondary": "See Services",
    "hero_image": "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
    "gallery_images": [
        "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
        "https://images.pexels.com/photos/13923477/pexels-photo-13923477.jpeg",
        "https://images.pexels.com/photos/6131576/pexels-photo-6131576.jpeg",
        "https://images.pexels.com/photos/35133324/pexels-photo-35133324.jpeg",
        "https://images.pexels.com/photos/8434635/pexels-photo-8434635.jpeg",
        "https://images.unsplash.com/photo-1601880348117-25c1127a95df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxkb2clMjBzbGVlcHxlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85"
    ],
    "how_it_works": [
        {"step": 1, "title": "Book Online", "description": "Choose your service and fill in your pet's details in minutes."},
        {"step": 2, "title": "We Confirm on WhatsApp", "description": "Simran personally confirms your booking and answers any questions."},
        {"step": 3, "title": "Your Pet is Happy", "description": "Drop off, or we pick up — your pet gets home-style love and care."},
    ],
    "trust_bar_items": ["4.8★ on Google", "500+ happy pet parents", "Cage-free", "Open 24/7", "Women-owned"],
}