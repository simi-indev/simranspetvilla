# Simran's PetVilla — PRD Tracker

## Original Problem
Build the website + Progressive Web App for Simran's PetVilla, a cage-free pet care business in Lohegaon, Pune offering 6 services. Drive year-round bookings, feel warm/cozy/trustworthy, mobile-first, end-to-end booking with WhatsApp confirmation, and admin dashboard. Brand: 4.4★ · 80+ reviews. Tagline: "Pune's most trusted cage-free pet care".

## Stack (chosen)
- Frontend: React 19 + Tailwind + Shadcn primitives + Lucide icons + Sonner toasts
- Backend: FastAPI + Motor (MongoDB)
- Auth: Simple admin password gate with Bearer token
- Integrations active: WhatsApp via wa.me deep links, Google Maps embed
- Integrations deferred per user: Razorpay, Brevo email, WATI WhatsApp API

## User Personas (from PRD)
1. The Traveller — needs Boarding + Pickup/Drop
2. The 9-to-5 Parent — needs Daycare + Pet Sitting
3. The Busy Couple — needs Home Grooming + Food Delivery
4. The New Pet Owner — needs Training + Food Delivery
5. The Anxious Senior — needs Pet Sitting + Updates

## Core Requirements (static)
- 6 services (Boarding, Daycare, Home Grooming, Pet Sitting, Food Delivery, Training)
- Mobile-first design (375px first, 70%+ mobile traffic expected)
- Tone: warm, not clinical · Real, not stocky · Distinctive, not generic blue
- Brand colors: Primary `#1B7B8A`, Secondary `#E8821A`, Background `#FAFAF8`
- Fonts: Nunito (display) + Inter (body)
- Core Web Vitals targets, WCAG 2.1 AA contrast

## Phase 1 — IMPLEMENTED (Apr 25, 2026)
- [x] Homepage: hero, trust bar, 6 service cards, how-it-works, testimonials carousel, gallery, service area + map, FAQ, CTA
- [x] All 6 service detail pages (`/services/:slug`) with hero, includes, how-to-book, FAQ, related services
- [x] Services index page
- [x] About page (story + 6 differentiators)
- [x] Reviews & Gallery page (rating summary + breakdown + reviews + photo grid)
- [x] Blog index + Blog post pages (6 SEO-targeted articles seeded)
- [x] Contact page (4 contact options + form + map)
- [x] 6-step booking wizard: Service → Pet → Dates → Owner → Review → Done
- [x] Multi-service selection in booking
- [x] Cancellation policy text in review step (PRD §18.1)
- [x] Pickup/drop checkbox in owner step
- [x] WhatsApp summary message generated on success
- [x] Sticky WhatsApp float (all marketing pages)
- [x] Mobile-only sticky bottom CTA bar (Book Now + WhatsApp)
- [x] Admin login (`/admin`) with password gate
- [x] Admin dashboard: stats grid, status filter chips, bookings table, contact leads tab, detail drawer with status update + customer WhatsApp link, CSV export
- [x] PWA manifest + theme color
- [x] Backend: 12 endpoints (services, reviews, blog, bookings, contact, admin auth, admin bookings/contacts/stats)

## Iteration 2 — REAL DATA + ADMIN CONTENT MANAGEMENT (Apr 25, 2026)
Real Google Business data integrated everywhere (rating 4.8, 500+ reviews, real address Suryasadan/Lohegaon-Wagholi Road, phones +91 99889 75056 / +91 77608 34823, email simran.kaurgill9@gmail.com, WhatsApp 919988975056, Open 24/7, Women-owned + LGBTQ+ friendly tags, founder Simran Kaur Gill).
- [x] Public reviews filtered server-side: only `rating >= 4 AND visible == true` are shown on the website (no negative reviews)
- [x] `business_info` MongoDB collection with seed-on-startup
- [x] `reviews` MongoDB collection with seed-on-startup
- [x] React Context `BusinessInfoProvider` propagates business info to header/footer/hero/trust-bar/contact/WhatsApp links — refreshes after admin edits
- [x] **Admin Business Info tab** — editable form for name, tagline, rating, review_count, phones, WhatsApp, email, address, hours, social links, founder, tags. Save updates the website in real-time.
- [x] **Admin Reviews tab** — CRUD + visibility toggle. Add new review, edit existing, hide/show on website (eye icon), delete. Reviews auto-filtered when rating drops below 4.

## Backend API Endpoints
- `GET /api/services` · `GET /api/services/{slug}`
- `GET /api/reviews`
- `GET /api/blog` · `GET /api/blog/{slug}`
- `POST /api/bookings` · `GET /api/bookings/{id}`
- `POST /api/contact`
- `POST /api/admin/login` (returns Bearer token)
- `GET /api/admin/bookings` · `PATCH /api/admin/bookings/{id}` · `GET /api/admin/contacts` · `GET /api/admin/stats`

## Test Status
- Backend: 100% (20/20 pytest cases)
- Frontend: ~90% — all marketing pages, contact form, admin login + dashboard verified end-to-end. Booking wizard step 1 verified visually + via backend create test.

## Phase 2 / Backlog (not implemented)
**P0 (next session)**
- Replace placeholder WhatsApp number `+91 98765 43210` with real number once provided
- Replace placeholder photos with real facility photos
- Lock final pricing per service (current values are PRD-suggested ranges)

**P1**
- Razorpay UPI advance integration on booking step 5 (need keys)
- Brevo email automation: welcome series, post-service review request, win-back at 90 days (need API key + custom domain DKIM/SPF)
- Area landing pages: `/pet-boarding-viman-nagar`, `/pet-boarding-kharadi`, `/pet-boarding-kalyani-nagar`
- Phone OTP / WhatsApp OTP for booking owner verification
- Schema.org structured data (LocalBusiness, Service, FAQPage, Review, BreadcrumbList) injection per page
- WATI integration for outbound WhatsApp templates

**P2**
- Loyalty Points programme (PRD §16.1) — Airtable manual now, app later
- Referral programme with unique codes (PRD §16.2)
- Subscription flow for Food Delivery (weekly/monthly)
- Database segmentation broadcast tool
- Push notifications (PWA)
- Instagram feed embed

## Known caveats
- Admin auth is single-password (no per-user accounts) — sufficient for an owner-only dashboard
- Blog/reviews are static in `server.py` — move to MongoDB when an editorial CMS is needed
- No rate-limit middleware on public POST endpoints (recommended before launch)
