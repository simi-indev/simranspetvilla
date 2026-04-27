"""
Pricing engine for Simran's PetVilla.
Mirrors the frontend logic in BookingPage.jsx exactly.
Used for server-side validation and quote generation.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import math

# ─── PRICING DATA (Mirrors JS PRICING) ───
PRICING = {
    "pet-boarding": {
        "dog-small": 600, "dog-medium": 700, "dog-large": 750, "dog-giant": 800,
        "cat": 500, "bird": 500, "rabbit": 300, "turtle": 500,
        "unit": "6-24hrs",
    },
    "pet-daycare": {
        "dog-small": 150, "dog-medium": 150, "dog-large": 150, "dog-giant": 150,
        "cat": 100, "bird": 100, "rabbit": 100, "turtle": 150,
        "unit": "hr",
    },
    "home-grooming": {
        "dog-small": 1700, "dog-medium": 1700, "dog-large": 1700, "dog-giant": 1700,
        "cat": 1700,
        "unit": "session",
    },
    "pet-sitting": {
        "hourly": 350,
        "fullday": {"dog": 1200, "other": 1000},
        "multiday": {"dog": 1500, "other": 1200},
    },
    "pet-food-delivery": {"egg": 99, "chicken": 149, "fish": 179, "lamb": 219, "unit": "meal"},
    "pet-training": {
        "dog-small": 1500, "dog-medium": 1500, "dog-large": 1500, "dog-giant": 1500,
        "unit": "session",
    },
}

PROTEINS = [
    {"value": "egg", "label": "Egg + Paneer", "price": 99},
    {"value": "chicken", "label": "Chicken & Rice", "price": 149},
    {"value": "fish", "label": "Fish & Quinoa", "price": 179},
    {"value": "lamb", "label": "Lamb & Pumpkin", "price": 219},
]

# ─── HELPERS ───

def get_price_key(species: str, size: Optional[str]) -> str:
    """Mirrors JS priceKey."""
    if species == "Dog":
        return f"dog-{size or 'medium'}"
    return species.lower()

def is_service_available(slug: str, species: str) -> bool:
    """Mirrors JS isServiceAvailable."""
    if slug == "pet-food-delivery":
        return species in ["Dog", "Cat"]
    if slug == "pet-training":
        return species == "Dog"
    if slug == "home-grooming":
        return species in ["Dog", "Cat"]
    if slug == "pet-sitting":
        return True
    
    table = PRICING.get(slug)
    if not table:
        return False
    
    key = get_price_key(species, "medium")
    return key in table

def get_service_price(slug: str, species: str, size: Optional[str]) -> int:
    """Mirrors JS getServicePrice."""
    table = PRICING.get(slug)
    if not table or slug in ["pet-food-delivery", "pet-sitting"]:
        return 0
    key = get_price_key(species, size)
    return table.get(key, 0)

def diff_days(start_str: str, end_str: str) -> int:
    """Mirrors JS diffDays."""
    if not start_str or not end_str:
        return 1
    try:
        start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
        delta = end - start
        days = math.ceil(delta.total_seconds() / 86400)
        return max(days, 1)
    except Exception:
        return 1

def get_sitting_cost(species: str, mode: str, hours: int, days: int) -> int:
    """Mirrors JS getSittingCost."""
    is_dog = species == "Dog"
    table = PRICING["pet-sitting"]
    
    if mode == "hourly":
        hourly_total = hours * table["hourly"]
        day_cap = table["multiday"]["dog" if is_dog else "other"]
        return min(hourly_total, day_cap)
    
    if mode == "fullday":
        rate = table["fullday"]["dog" if is_dog else "other"]
        return rate * (days or 1)
    
    if mode == "multiday":
        rate = table["multiday"]["dog" if is_dog else "other"]
        return rate * (days or 1)
        
    return 0

# ─── MAIN ENGINE ───

def calculate_quote(
    selected_slugs: List[str], 
    pets: List[Dict[str, Any]], 
    dates: Dict[str, Any], 
    options: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Core engine. Mirrors JS calculateQuote exactly.
    Input matches the data structure of the frontend BookingPage state.
    """
    lines = []
    subtotal = 0

    for idx, pet in enumerate(pets):
        name = pet.get("name") or f"Pet {idx + 1}"
        species = pet.get("species", "Dog")
        size = pet.get("size", "medium")

        for slug in selected_slugs:
            if not is_service_available(slug, species):
                continue

            if slug == "pet-food-delivery":
                protein = options.get("foodProtein", "chicken")
                pp = next((p for p in PROTEINS if p["value"] == protein), PROTEINS[1])
                meals_per_day = dates.get("mealsPerDay") or options.get("mealsPerDay") or 2
                days = dates.get("foodDays") or 7
                cost = pp["price"] * meals_per_day * days
                lines.append({"label": f"{name} — Food Delivery ({pp['label']}, {meals_per_day}x/day, {days} days)", "amount": cost})
                subtotal += cost

            elif slug == "pet-daycare":
                hours = dates.get("daycareHours") or 4
                days = dates.get("daycareDays") or 1
                boarding_rate = PRICING["pet-boarding"].get(get_price_key(species, size), 600)
                hourly_rate = PRICING["pet-daycare"].get(get_price_key(species, size), 150)
                day_cost = min(hours * hourly_rate, boarding_rate)
                cost = day_cost * days
                capped = (hours * hourly_rate) > boarding_rate
                label = f"{name} — Daycare ({hours}h x {days}d{' · capped' if capped else ''})"
                lines.append({"label": label, "amount": cost})
                subtotal += cost

            elif slug == "pet-boarding":
                nights = diff_days(dates.get("startDate"), dates.get("endDate"))
                rate = get_service_price(slug, species, size)
                cost = rate * nights
                label = f"{name} — Boarding (₹{rate} x {nights} night{'s' if nights > 1 else ''})"
                lines.append({"label": label, "amount": cost})
                subtotal += cost

            elif slug == "pet-sitting":
                mode = dates.get("sittingMode", "hourly")
                hours = dates.get("sittingHours") or 3
                if mode == "multiday":
                    days = diff_days(dates.get("sittingStart"), dates.get("sittingEnd"))
                else:
                    days = dates.get("sittingDays") or 1
                
                cost = get_sitting_cost(species, mode, hours, days)
                is_dog = species == "Dog"
                day_cap = PRICING["pet-sitting"]["multiday"]["dog" if is_dog else "other"]
                capped = mode == "hourly" and (hours * PRICING["pet-sitting"]["hourly"] > day_cap)
                
                if mode == "hourly":
                    mode_label = f"{hours}h"
                elif mode == "fullday":
                    mode_label = f"{days} day{'s' if days > 1 else ''}"
                else:
                    mode_label = f"{days} day{'s' if days > 1 else ''}"
                
                label = f"{name} — Sitting ({mode_label}{' · capped' if capped else ''})"
                lines.append({"label": label, "amount": cost})
                subtotal += cost

            elif slug == "pet-training":
                sessions = dates.get("trainingSessions") or 1
                rate = get_service_price(slug, species, size)
                cost = rate * sessions
                lines.append({"label": f"{name} — Training ({sessions} session{'s' if sessions > 1 else ''})", "amount": cost})
                subtotal += cost

            else:
                rate = get_service_price(slug, species, size)
                lines.append({"label": f"{name} — {slug.replace('-', ' ').title()}", "amount": rate})
                subtotal += rate

    # ─── Options & Adjustments ───
    separate_room_cost = 0
    if options.get("separateRoom"):
        nights = diff_days(dates.get("startDate"), dates.get("endDate"))
        separate_room_cost = 100 * nights
        lines.append({"label": f"Separate room (+₹100 x {nights} night{'s' if nights > 1 else ''})", "amount": separate_room_cost})
        subtotal += separate_room_cost

    # Multi-pet discount (10%)
    multi_pet_discount = 0
    if len(pets) >= 2:
        multi_pet_discount = round(subtotal * 0.1)
    after_multi_pet = subtotal - multi_pet_discount

    # Admin discount
    discount_pct = options.get("discountPercent", 0)
    admin_discount = 0
    if discount_pct > 0:
        admin_discount = round(after_multi_pet * (discount_pct / 100))
    after_discounts = after_multi_pet - admin_discount

    # Pay choices
    full_pay_discount = round(after_discounts * 0.02)
    pay50 = round(after_discounts * 0.5)
    pay100 = after_discounts - full_pay_discount

    return {
        "lines": lines,
        "subtotal": subtotal,
        "separate_room_cost": separate_room_cost,
        "multi_pet_discount": multi_pet_discount,
        "admin_discount": admin_discount,
        "after_discounts": after_discounts,
        "full_pay_discount": full_pay_discount,
        "pay50": pay50,
        "pay100": pay100
    }
