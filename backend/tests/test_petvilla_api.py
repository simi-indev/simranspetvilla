"""
Backend regression tests for Simran's PetVilla API.
Covers: services, reviews, blog, bookings, contact, admin auth + CRUD, stats.
"""
import os
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load frontend .env to use the public URL (same as user-facing)
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
# Admin password is read from env; never hardcoded. Pytest run with: ADMIN_PASSWORD=... pytest
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD") or os.environ.get("PV_ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    # Fall back to backend/.env so test infra can use the same source of truth as the server
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
assert ADMIN_PASSWORD, "ADMIN_PASSWORD env var is required to run admin tests"

EXPECTED_SLUGS = {
    "pet-boarding",
    "pet-daycare",
    "home-grooming",
    "pet-sitting",
    "pet-food-delivery",
    "pet-training",
}


# ---------------- Fixtures ----------------
@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    token = r.json().get("token")
    assert token
    return token


@pytest.fixture(scope="module")
def admin_api(admin_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return s


# ---------------- Catalog: services ----------------
class TestServices:
    def test_list_services(self, api):
        r = api.get(f"{BASE_URL}/api/services")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6
        slugs = {s["slug"] for s in data}
        assert slugs == EXPECTED_SLUGS
        for s in data:
            assert "name" in s and "starting_price" in s and "max_price" in s
            assert "includes" in s and isinstance(s["includes"], list)
            assert "faqs" in s and isinstance(s["faqs"], list)

    def test_get_service_detail(self, api):
        r = api.get(f"{BASE_URL}/api/services/pet-boarding")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "pet-boarding"
        assert len(d["includes"]) >= 3
        assert len(d["faqs"]) >= 3
        assert all("q" in f and "a" in f for f in d["faqs"])

    def test_get_service_not_found(self, api):
        r = api.get(f"{BASE_URL}/api/services/does-not-exist")
        assert r.status_code == 404


# ---------------- Reviews (public, filtered) ----------------
class TestReviews:
    def test_list_reviews_only_visible_and_high_rating(self, api):
        r = api.get(f"{BASE_URL}/api/reviews")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Public endpoint must filter out hidden + low rating reviews
        for rv in data:
            assert "name" in rv and "rating" in rv and "text" in rv
            assert rv["rating"] >= 4
            assert rv.get("visible", True) == True  # noqa: E712


# ---------------- Business Info (public) ----------------
class TestBusinessInfo:
    def test_business_info_returns_real_data(self, api):
        r = api.get(f"{BASE_URL}/api/business-info")
        assert r.status_code == 200
        d = r.json()
        # Real data from Google Maps listing
        assert d["name"] == "Simran's PetVilla"
        assert d["rating"] == 4.8
        assert d["review_count"] == 500
        assert d["phone_primary"] == "+91 99889 75056"
        assert d["whatsapp_number"] == "919988975056"
        assert d["email"] == "simran.kaurgill9@gmail.com"
        tags = d.get("tags", [])
        assert "Women-owned" in tags
        assert "LGBTQ+ friendly" in tags


# ---------------- Blog ----------------
class TestBlog:
    def test_list_blogs_no_content(self, api):
        r = api.get(f"{BASE_URL}/api/blog")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        for b in data:
            assert "slug" in b and "title" in b and "excerpt" in b
            assert "content" not in b  # excluded from listing

    def test_get_blog_detail_has_content(self, api):
        # use a known slug from listing
        listing = api.get(f"{BASE_URL}/api/blog").json()
        slug = listing[0]["slug"]
        r = api.get(f"{BASE_URL}/api/blog/{slug}")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == slug
        assert "content" in d and isinstance(d["content"], list) and len(d["content"]) > 0

    def test_get_blog_not_found(self, api):
        r = api.get(f"{BASE_URL}/api/blog/does-not-exist-xyz")
        assert r.status_code == 404


# ---------------- Bookings ----------------
class TestBookings:
    booking_id = None

    def _payload(self):
        return {
            "services": ["pet-boarding"],
            "pet": {
                "name": "TEST_Bruno",
                "species": "Dog",
                "breed": "Labrador",
                "age": "3y",
                "weight": "25kg",
                "vaccinated": True,
            },
            "start_date": "2026-02-10",
            "end_date": "2026-02-12",
            "owner": {
                "name": "TEST_User",
                "phone": "9876543210",
                "email": "test@example.com",
                "locality": "Kharadi",
            },
            "estimated_price": 1200,
            "notes": "Test booking",
        }

    def test_create_booking(self, api):
        r = api.post(f"{BASE_URL}/api/bookings", json=self._payload())
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d and len(d["id"]) > 0
        assert d["status"] == "new"
        assert d["pet"]["name"] == "TEST_Bruno"
        assert d["services"] == ["pet-boarding"]
        TestBookings.booking_id = d["id"]

    def test_get_booking_persisted(self, api):
        assert TestBookings.booking_id
        r = api.get(f"{BASE_URL}/api/bookings/{TestBookings.booking_id}")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == TestBookings.booking_id
        assert d["status"] == "new"


# ---------------- Contact ----------------
class TestContact:
    def test_create_contact(self, api):
        payload = {
            "name": "TEST_Contact",
            "phone": "9876500000",
            "email": "contact@test.com",
            "message": "Test contact message",
        }
        r = api.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d
        assert d["name"] == "TEST_Contact"
        assert d["handled"] == False  # noqa: E712


# ---------------- Admin auth ----------------
class TestAdminAuth:
    def test_login_correct_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong-pass"})
        assert r.status_code == 401

    def test_admin_bookings_no_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/bookings")
        assert r.status_code == 401

    def test_admin_bookings_with_auth(self, admin_api):
        r = admin_api.get(f"{BASE_URL}/api/admin/bookings")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_contacts_with_auth(self, admin_api):
        r = admin_api.get(f"{BASE_URL}/api/admin/contacts")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_stats(self, admin_api):
        r = admin_api.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 200
        d = r.json()
        for k in [
            "total_bookings", "new", "confirmed", "completed", "cancelled",
            "contacts", "reviews_total", "reviews_visible",
        ]:
            assert k in d
            assert isinstance(d[k], int)


# ---------------- Admin: Business Info update ----------------
class TestAdminBusinessInfo:
    def test_put_business_info_requires_auth(self, api):
        r = api.put(f"{BASE_URL}/api/admin/business-info", json={"rating": 4.7})
        assert r.status_code in (401, 403)

    def test_put_business_info_updates_and_restores(self, api, admin_api):
        # Capture original values to restore at the end
        orig = api.get(f"{BASE_URL}/api/business-info").json()
        try:
            # Update a few fields
            new_payload = {
                "rating": 4.9,
                "review_count": 555,
                "tagline": "TEST_TAGLINE",
                "phone_primary": "+91 90000 00001",
            }
            r = admin_api.put(f"{BASE_URL}/api/admin/business-info", json=new_payload)
            assert r.status_code == 200, r.text
            d = r.json()
            assert d["rating"] == 4.9
            assert d["review_count"] == 555
            assert d["tagline"] == "TEST_TAGLINE"
            assert d["phone_primary"] == "+91 90000 00001"

            # Verify persisted via public GET
            d2 = api.get(f"{BASE_URL}/api/business-info").json()
            assert d2["rating"] == 4.9
            assert d2["tagline"] == "TEST_TAGLINE"
        finally:
            # Restore original values so other iterations don't see corrupted state
            restore = {
                "rating": orig.get("rating", 4.8),
                "review_count": orig.get("review_count", 500),
                "tagline": orig.get("tagline", "Your Pet's Second Home"),
                "phone_primary": orig.get("phone_primary", "+91 99889 75056"),
                "whatsapp_number": orig.get("whatsapp_number", "919988975056"),
            }
            admin_api.put(f"{BASE_URL}/api/admin/business-info", json=restore)


# ---------------- Admin: Reviews CRUD ----------------
class TestAdminReviewsCRUD:
    def test_admin_list_reviews_includes_all(self, admin_api, api):
        r = admin_api.get(f"{BASE_URL}/api/admin/reviews")
        assert r.status_code == 200
        admin_reviews = r.json()
        public_reviews = api.get(f"{BASE_URL}/api/reviews").json()
        # Admin list should be >= public list (admin sees hidden + low rating)
        assert len(admin_reviews) >= len(public_reviews)

    def test_admin_reviews_requires_auth(self, api):
        assert api.get(f"{BASE_URL}/api/admin/reviews").status_code in (401, 403)
        assert api.post(f"{BASE_URL}/api/admin/reviews", json={}).status_code in (401, 403)

    def test_create_review_invalid_rating(self, admin_api):
        payload = {
            "name": "TEST_BadRating", "pet": "Pet", "rating": 6,
            "service": "Pet Boarding", "text": "Too high",
        }
        r = admin_api.post(f"{BASE_URL}/api/admin/reviews", json=payload)
        assert r.status_code == 400

    def test_low_rating_review_excluded_from_public(self, admin_api, api):
        payload = {
            "name": "TEST_NegativeReviewer", "pet": "TEST_Pet", "rating": 2,
            "service": "Pet Boarding", "text": "TEST_Bad experience", "visible": True,
        }
        r = admin_api.post(f"{BASE_URL}/api/admin/reviews", json=payload)
        assert r.status_code == 200, r.text
        rid = r.json()["id"]
        try:
            public = api.get(f"{BASE_URL}/api/reviews").json()
            ids = {rv["id"] for rv in public}
            assert rid not in ids, "Low-rating review must not appear in public list"
        finally:
            admin_api.delete(f"{BASE_URL}/api/admin/reviews/{rid}")

    def test_hidden_review_excluded_from_public(self, admin_api, api):
        payload = {
            "name": "TEST_HiddenReviewer", "pet": "TEST_Pet", "rating": 5,
            "service": "Pet Boarding", "text": "TEST_Hidden", "visible": False,
        }
        r = admin_api.post(f"{BASE_URL}/api/admin/reviews", json=payload)
        assert r.status_code == 200, r.text
        rid = r.json()["id"]
        try:
            public = api.get(f"{BASE_URL}/api/reviews").json()
            ids = {rv["id"] for rv in public}
            assert rid not in ids, "Hidden 5-star review must not appear in public list"
        finally:
            admin_api.delete(f"{BASE_URL}/api/admin/reviews/{rid}")

    def test_patch_review_toggles_visibility_and_text(self, admin_api, api):
        # Create a hidden review then make it visible
        payload = {
            "name": "TEST_ToggleReviewer", "pet": "TEST_Pet", "rating": 5,
            "service": "Pet Sitting", "text": "TEST_Original", "visible": False,
        }
        rid = admin_api.post(f"{BASE_URL}/api/admin/reviews", json=payload).json()["id"]
        try:
            # Confirm hidden
            public_ids_before = {rv["id"] for rv in api.get(f"{BASE_URL}/api/reviews").json()}
            assert rid not in public_ids_before

            # Toggle visible + edit text
            r = admin_api.patch(
                f"{BASE_URL}/api/admin/reviews/{rid}",
                json={"visible": True, "text": "TEST_Edited"},
            )
            assert r.status_code == 200
            assert r.json()["visible"] == True  # noqa: E712
            assert r.json()["text"] == "TEST_Edited"

            # Now appears in public list
            public_ids_after = {rv["id"] for rv in api.get(f"{BASE_URL}/api/reviews").json()}
            assert rid in public_ids_after
        finally:
            admin_api.delete(f"{BASE_URL}/api/admin/reviews/{rid}")

    def test_patch_review_not_found(self, admin_api):
        r = admin_api.patch(
            f"{BASE_URL}/api/admin/reviews/non-existent-xyz",
            json={"text": "x"},
        )
        assert r.status_code == 404

    def test_delete_review_not_found(self, admin_api):
        r = admin_api.delete(f"{BASE_URL}/api/admin/reviews/non-existent-xyz")
        assert r.status_code == 404

    def test_create_then_delete_review(self, admin_api):
        payload = {
            "name": "TEST_CreateDelete", "pet": "TEST_Pet", "rating": 5,
            "service": "Pet Boarding", "text": "TEST_Will be deleted",
        }
        rid = admin_api.post(f"{BASE_URL}/api/admin/reviews", json=payload).json()["id"]
        r = admin_api.delete(f"{BASE_URL}/api/admin/reviews/{rid}")
        assert r.status_code == 200
        # Verify gone via PATCH on same id returns 404
        r2 = admin_api.patch(f"{BASE_URL}/api/admin/reviews/{rid}", json={"text": "x"})
        assert r2.status_code == 404


# ---------------- Admin status update ----------------
class TestAdminBookingStatus:
    def test_create_then_update_status(self, api, admin_api):
        # Create
        payload = {
            "services": ["pet-daycare"],
            "pet": {"name": "TEST_StatusPet", "species": "Dog"},
            "start_date": "2026-03-01",
            "owner": {"name": "TEST_StatusOwner", "phone": "9000000000"},
        }
        r = api.post(f"{BASE_URL}/api/bookings", json=payload)
        assert r.status_code == 200
        bid = r.json()["id"]

        # Update to confirmed
        r2 = admin_api.patch(f"{BASE_URL}/api/admin/bookings/{bid}", json={"status": "confirmed"})
        assert r2.status_code == 200
        assert r2.json()["status"] == "confirmed"

        # Verify via GET
        r3 = api.get(f"{BASE_URL}/api/bookings/{bid}")
        assert r3.status_code == 200
        assert r3.json()["status"] == "confirmed"

    def test_invalid_status_rejected(self, api, admin_api):
        payload = {
            "services": ["pet-daycare"],
            "pet": {"name": "TEST_BadStatus", "species": "Dog"},
            "start_date": "2026-03-01",
            "owner": {"name": "TEST_Owner", "phone": "9000000001"},
        }
        bid = api.post(f"{BASE_URL}/api/bookings", json=payload).json()["id"]
        r = admin_api.patch(f"{BASE_URL}/api/admin/bookings/{bid}", json={"status": "garbage"})
        assert r.status_code == 400

    def test_update_not_found(self, admin_api):
        r = admin_api.patch(
            f"{BASE_URL}/api/admin/bookings/non-existent-id-xyz",
            json={"status": "confirmed"},
        )
        assert r.status_code == 404

    def test_filter_by_status(self, admin_api):
        r = admin_api.get(f"{BASE_URL}/api/admin/bookings?status=confirmed")
        assert r.status_code == 200
        for b in r.json():
            assert b["status"] == "confirmed"
