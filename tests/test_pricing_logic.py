import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from services.pricing_service import calculate_quote

def test_logic():
    payload = {
        "selected_slugs": ["pet-boarding"],
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
    
    print("Testing logic with payload...")
    result = calculate_quote(**payload)
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_logic()
