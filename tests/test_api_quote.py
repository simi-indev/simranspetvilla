import sys
import os
from fastapi.testclient import TestClient

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from server import app

client = TestClient(app)

def test_quote_endpoint():
    payload = {
        "selectedSlugs": ["pet-boarding"],
        "pets": [
            {"name": "Bruno", "species": "Dog", "size": "medium"}
        ],
        "dates": {
            "startDate": "2026-05-01",
            "endDate": "2026-05-03"
        },
        "options": {
            "separateRoom": False,
            "discountPercent": 0
        }
    }
    
    print("Testing /api/bookings/quote endpoint...")
    response = client.post("/api/bookings/quote", json=payload)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        import json
        print(json.dumps(response.json(), indent=2))
    else:
        print(response.text)

if __name__ == "__main__":
    # Mocking environment variables for server startup
    os.environ["MONGO_URL"] = "mongodb://localhost:27017"
    os.environ["DB_NAME"] = "testdb"
    test_quote_endpoint()
