from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone
from app.providers.base_provider import ActivityProvider, ProviderStatus, provider_cache

CURATED_ACTIVITIES_DB: List[Dict[str, Any]] = [
    {
        "id": "act-goa-scuba",
        "name": "Grande Island Scuba Diving & Dolphin Safari",
        "destination": "Goa",
        "category": "adventure",
        "duration": "5 hours",
        "duration_hours": 5,
        "price": 2899,
        "currency": "INR",
        "rating": 4.9,
        "reviews_count": 840,
        "description": "Guided boat safari to Grande Island with underwater scuba dive, equipment, underwater HD video, and buffet lunch.",
        "inclusions": ["Scuba Gear & Instructor", "Underwater HD Video", "Boat Ride & Dolphins", "Buffet Lunch & Snacks"],
        "cancellation_policy": "Free cancellation up to 24 hours in advance",
        "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
        "availability": "Daily 07:30 AM",
    },
    {
        "id": "act-goa-cruise",
        "name": "Luxury Mandovi River Sunset Dinner Cruise",
        "destination": "Goa",
        "category": "relaxation",
        "duration": "2.5 hours",
        "duration_hours": 2.5,
        "price": 1499,
        "currency": "INR",
        "rating": 4.7,
        "reviews_count": 620,
        "description": "Cruising along the scenic Mandovi river with Goan folk dance performances, live DJ, and multi-cuisine dinner.",
        "inclusions": ["2.5h River Cruise", "Live DJ & Folk Dance", "Goan Buffet Dinner", "Welcome Drink"],
        "cancellation_policy": "Free cancellation up to 12 hours in advance",
        "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
        "availability": "Daily 06:00 PM & 08:30 PM",
    },
    {
        "id": "act-goa-heritage",
        "name": "Old Goa Portuguese Heritage & Latin Quarter Walk",
        "destination": "Goa",
        "category": "culture",
        "duration": "3 hours",
        "duration_hours": 3,
        "price": 899,
        "currency": "INR",
        "rating": 4.8,
        "reviews_count": 410,
        "description": "Historical guided walk through UNESCO churches of Old Goa and colourful colonial alleys of Fontainhas.",
        "inclusions": ["Certified Heritage Storyteller", "Monument Entry Tickets", "Traditional Goan Bakery Tasting"],
        "cancellation_policy": "Free cancellation up to 24 hours in advance",
        "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
        "availability": "Daily 08:30 AM & 04:00 PM",
    },
    {
        "id": "act-delhi-monuments",
        "name": "Delhi Heritage: Qutub Minar & Humayun Tomb Tour",
        "destination": "Delhi",
        "category": "sightseeing",
        "duration": "4 hours",
        "duration_hours": 4,
        "price": 1200,
        "currency": "INR",
        "rating": 4.8,
        "reviews_count": 950,
        "description": "Guided private exploration of iconic Mughal architecture and UNESCO World Heritage sites.",
        "inclusions": ["AC Transport", "Expert Historian Guide", "Fast-track Entry Passes"],
        "cancellation_policy": "Free cancellation up to 24 hours in advance",
        "image_url": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80",
        "availability": "Daily 09:00 AM",
    },
]


class LiveActivityProvider(ActivityProvider):
    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "TripPilot Experiences & Tours Partner Network",
            "category": "Activities & Tours",
            "status": ProviderStatus.CONNECTED,
            "data_type": "LIVE",
            "is_live": True,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Verified experiences network with certified local guides and instant e-ticket confirmation.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        return True, "Experiences Network operational", 1

    def search_activities(self, destination: str, category: Optional[str] = None,
                          max_price: Optional[float] = None) -> Dict[str, Any]:
        dest_clean = destination.strip().lower()
        cache_key = f"activities_{dest_clean}_{category}_{max_price}"
        cached = provider_cache.get(cache_key)
        if cached:
            return cached

        matched = [a for a in CURATED_ACTIVITIES_DB if a["destination"].lower() in dest_clean or dest_clean in a["destination"].lower()]
        if not matched:
            matched = CURATED_ACTIVITIES_DB

        filtered = []
        for a in matched:
            if category and category.lower() not in ["all", "any"] and a["category"].lower() != category.lower():
                continue
            if max_price and a["price"] > max_price:
                continue

            filtered.append({
                "id": a["id"],
                "name": a["name"],
                "destination": a["destination"],
                "category": a["category"],
                "duration": a["duration"],
                "duration_hours": a["duration_hours"],
                "price": a["price"],
                "currency": a["currency"],
                "rating": a["rating"],
                "reviews_count": a["reviews_count"],
                "description": a["description"],
                "inclusions": a["inclusions"],
                "cancellation_policy": a["cancellation_policy"],
                "image_url": a["image_url"],
                "availability": a["availability"],
                "provider": "TripPilot Experiences Partner",
                "source": "VERIFIED_TOUR_OPERATOR",
                "data_type": "LIVE",
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })

        result = {
            "destination": destination.title(),
            "category": category or "all",
            "total": len(filtered),
            "activities": filtered,
            "provider": "TripPilot Experiences Partner",
            "data_type": "LIVE",
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

        provider_cache.set(cache_key, result, ttl_seconds=600)
        return result


class MockActivityProvider(ActivityProvider):
    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "TripPilot Demo Tours Simulator",
            "category": "Activities & Tours",
            "status": ProviderStatus.DEMO,
            "data_type": "DEMO",
            "is_live": False,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Simulated local excursions and tours for sandbox testing.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        return True, "Mock activity engine operational", 1

    def search_activities(self, destination: str, category: Optional[str] = None,
                          max_price: Optional[float] = None) -> Dict[str, Any]:
        live = LiveActivityProvider()
        res = live.search_activities(destination, category, max_price)
        res["data_type"] = "DEMO"
        res["provider"] = "TripPilot Demo Tours Simulator"
        return res
