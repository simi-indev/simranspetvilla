import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_sanity():
    print("🚀 Starting Production Sanity Check...")
    
    # 1. Public Route Check
    try:
        resp = requests.get(f"{BASE_URL}/services")
        if resp.status_code == 200:
            print("✅ Public Services: OK (Fallback/DB working)")
        else:
            print(f"❌ Public Services: FAILED ({resp.status_code})")
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return

    # 2. Login Check
    # Note: Assumes default dev password if hash not set
    login_payload = {"password": "petvilla2026"}
    token = None
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json=login_payload)
        if resp.status_code == 200:
            token = resp.json().get("token")
            print("✅ Admin Login: OK")
        else:
            print(f"❌ Admin Login: FAILED ({resp.status_code}) - Password might be different")
    except Exception as e:
        print(f"❌ Login Error: {e}")

    # 3. Protected Route Check
    if token:
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
            if resp.status_code == 200:
                print("✅ Protected Stats: OK")
            elif resp.status_code == 500:
                print("⚠️ Protected Stats: DB Error (Handled but DB is likely down)")
            else:
                print(f"❌ Protected Stats: FAILED ({resp.status_code})")
        except Exception as e:
            print(f"❌ Stats Error: {e}")

    # 4. Auth Failure Check
    try:
        resp = requests.get(f"{BASE_URL}/admin/stats", headers={"Authorization": "Bearer invalid-token"})
        if resp.status_code == 401:
            print("✅ Auth Security: OK (Rejected invalid token)")
        else:
            print(f"❌ Auth Security: FAILED (Accepted invalid token!)")
    except Exception as e:
        print(f"❌ Security Check Error: {e}")

    print("\n🏁 Sanity Check Complete.")

if __name__ == "__main__":
    test_sanity()
