import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from services.pricing_service import calculate_quote

def test_robustness():
    payload = {
        "selected_slugs": ["  pet-boarding  "],
        "pets": [
            {"name": "Bruno", "species": "dog", "size": "MEDIUM"}
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
    
    print("Testing robustness with dirty payload...")
    result = calculate_quote(**payload)
    import json
    print(json.dumps(result, indent=2))
    assert result["subtotal"] == 1400

if __name__ == "__main__":
    test_robustness()
