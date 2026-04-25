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
ADMIN_PASSWORD = "petvilla2026"

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


# ---------------- Reviews ----------------
class TestReviews:
    def test_list_reviews(self, api):
        r = api.get(f"{BASE_URL}/api/reviews")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6
        for rv in data:
            assert "name" in rv and "rating" in rv and "text" in rv


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
        assert d["handled"] is False


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
        for k in ["total_bookings", "new", "confirmed", "completed", "cancelled", "contacts"]:
            assert k in d
            assert isinstance(d[k], int)


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
