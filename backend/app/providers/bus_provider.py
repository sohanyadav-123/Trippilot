import random
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone
from app.providers.base_provider import BusProvider, ProviderStatus, provider_cache

BUS_OPERATORS_DB = [
    {
        "operator": "IntrCity SmartBus",
        "bus_type": "Volvo Multi-Axle 9600 A/C Sleeper (2+1)",
        "rating": 4.8,
        "review_count": 1240,
        "departure_time": "20:30",
        "arrival_time": "08:15",
        "duration": "11h 45m",
        "price": 1450,
        "seats_available": 14,
        "amenities": ["Individual LCD Screen", "Charging Point", "Emergency SOS", "Blanket & Pillow", "Live Bus Tracking", "Clean Washroom"],
        "boarding_points": ["Borivali (West) 20:30", "Andheri (East) 21:15", "Vashi Plaza 22:30"],
        "dropping_points": ["Mapusa Bus Stand 07:30", "Panjim KTC 08:15", "Madgaon 09:10"],
    },
    {
        "operator": "Zingbus Electric Lounge",
        "bus_type": "Electric Luxury AC Sleeper",
        "rating": 4.7,
        "review_count": 890,
        "departure_time": "21:45",
        "arrival_time": "09:30",
        "duration": "11h 45m",
        "price": 1299,
        "seats_available": 8,
        "amenities": ["Zero Emissions EV", "USB Fast Charging", "Free Wi-Fi", "Water Bottle", "Female Co-traveller Filter"],
        "boarding_points": ["Sion Circle 21:45", "Chembur 22:05", "Navi Mumbai 22:50"],
        "dropping_points": ["Panjim Bus Stand 08:45", "Calangute Circle 09:30"],
    },
    {
        "operator": "Paulo Travels Executive",
        "bus_type": "Scania Multi-Axle AC Semi-Sleeper (2+2)",
        "rating": 4.4,
        "review_count": 620,
        "departure_time": "19:00",
        "arrival_time": "07:15",
        "duration": "12h 15m",
        "price": 950,
        "seats_available": 22,
        "amenities": ["Reading Lights", "Charging Point", "Luggage Storage"],
        "boarding_points": ["Dadar (East) 19:00", "Thane 20:00"],
        "dropping_points": ["Mapusa 06:45", "Panjim 07:15"],
    },
]


class MockBusProvider(BusProvider):
    """Realistic Intercity Bus Network Provider in Demo/Sandbox Mode."""

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "TripPilot Intercity Bus Network",
            "category": "Buses",
            "status": ProviderStatus.DEMO,
            "data_type": "DEMO",
            "is_live": False,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Simulated intercity luxury bus network with Volvo multi-axle, sleeper choices, and live tracking.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        return True, "Mock bus network operational", 1

    def search_buses(self, origin: str, destination: str, date: str) -> Dict[str, Any]:
        orig = origin.strip().title() or "Mumbai"
        dest = destination.strip().title() or "Goa"

        cache_key = f"buses_{orig}_{dest}_{date}"
        cached = provider_cache.get(cache_key)
        if cached:
            return cached

        buses = []
        for idx, b in enumerate(BUS_OPERATORS_DB):
            buses.append({
                "id": f"bus-{idx+1}-{orig[:3]}-{dest[:3]}",
                "operator": b["operator"],
                "bus_type": b["bus_type"],
                "origin": orig,
                "destination": dest,
                "departure_time": b["departure_time"],
                "arrival_time": b["arrival_time"],
                "duration": b["duration"],
                "travel_date": date,
                "price": b["price"],
                "currency": "INR",
                "rating": b["rating"],
                "review_count": b["review_count"],
                "seats_available": b["seats_available"],
                "amenities": b["amenities"],
                "boarding_points": b["boarding_points"],
                "dropping_points": b["dropping_points"],
                "provider": "TripPilot Bus Partner",
                "source": "SIMULATED_BUS_SCHEDULE",
                "data_type": "DEMO",
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })

        result = {
            "origin": orig,
            "destination": dest,
            "date": date,
            "total": len(buses),
            "buses": buses,
            "provider": "TripPilot Bus Partner",
            "data_type": "DEMO",
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

        provider_cache.set(cache_key, result, ttl_seconds=600)
        return result
