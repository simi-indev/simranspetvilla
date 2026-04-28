import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_quote():
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
    
    print(f"Testing Quote API with payload: {json.dumps(payload, indent=2)}")
    try:
        response = requests.post(f"{BASE_URL}/bookings/quote", json=payload)
        if response.status_code == 200:
            print("Response success!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Response failed with status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    test_quote()
