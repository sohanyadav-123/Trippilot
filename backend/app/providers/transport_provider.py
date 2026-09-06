from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone
from app.providers.base_provider import TransportProvider, ProviderStatus, provider_cache

VEHICLE_FLEET_DB = [
    {
        "vehicle_type": "Comfort Sedan",
        "vehicle_model": "Maruti Dzire / Toyota Etios",
        "category": "sedan",
        "capacity_passengers": 4,
        "capacity_luggage": 2,
        "price_per_km": 14,
        "base_transfer_price": 1200,
        "rating": 4.8,
        "features": ["Air Conditioned", "Sanitized Cab", "Top Rated Driver", "Toll Included"],
        "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
    },
    {
        "vehicle_type": "Executive SUV",
        "vehicle_model": "Toyota Innova Crysta",
        "category": "suv",
        "capacity_passengers": 6,
        "capacity_luggage": 4,
        "price_per_km": 20,
        "base_transfer_price": 1850,
        "rating": 4.9,
        "features": ["Captain Seats", "High Luggage Room", "Dual AC", "Highway Specialist Driver"],
        "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    },
    {
        "vehicle_type": "Eco EV Cab",
        "vehicle_model": "Tata Nexon EV Max",
        "category": "electric",
        "capacity_passengers": 4,
        "capacity_luggage": 2,
        "price_per_km": 12,
        "base_transfer_price": 1100,
        "rating": 4.9,
        "features": ["Zero Emission", "Silent Ride", "Fast Charging Included", "Modern Tech"],
        "image_url": "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80",
    },
    {
        "vehicle_type": "Luxury Chauffeur",
        "vehicle_model": "Mercedes-Benz E-Class",
        "category": "luxury",
        "capacity_passengers": 3,
        "capacity_luggage": 2,
        "price_per_km": 55,
        "base_transfer_price": 4500,
        "rating": 5.0,
        "features": ["Uniformed Chauffeur", "Bottled Spring Water", "Plush Leather Interior", "VIP Meet & Greet"],
        "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
    },
]


class MockTransportProvider(TransportProvider):
    """Realistic Cab & Airport Transfer Provider in Demo/Sandbox Mode."""

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "TripPilot Mobility & Transfer Fleet",
            "category": "Cabs & Airport Transfers",
            "status": ProviderStatus.DEMO,
            "data_type": "DEMO",
            "is_live": False,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Simulated airport transfers, intercity chauffeur cabs, and luxury rentals with transparent pricing.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        return True, "Mock transport fleet operational", 1

    def search_transport(self, origin: str, destination: str, date: str, transport_type: str = "all") -> Dict[str, Any]:
        orig = origin.strip().title() or "Airport (GOI)"
        dest = destination.strip().title() or "North Goa Hotel"

        cache_key = f"transport_{orig}_{dest}_{date}_{transport_type}"
        cached = provider_cache.get(cache_key)
        if cached:
            return cached

        results = []
        for v in VEHICLE_FLEET_DB:
            if transport_type.lower() not in ["all", "any"] and v["category"] != transport_type.lower():
                continue

            results.append({
                "id": f"cab-{v['category']}-{orig[:3]}",
                "vehicle_type": v["vehicle_type"],
                "vehicle_model": v["vehicle_model"],
                "category": v["category"],
                "origin": orig,
                "destination": dest,
                "travel_date": date,
                "capacity_passengers": v["capacity_passengers"],
                "capacity_luggage": v["capacity_luggage"],
                "estimated_duration": "45-60 mins",
                "price": v["base_transfer_price"],
                "currency": "INR",
                "rating": v["rating"],
                "features": v["features"],
                "image_url": v["image_url"],
                "provider": "TripPilot Mobility Fleet",
                "source": "SIMULATED_FLEET_DISPATCH",
                "data_type": "DEMO",
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })

        result = {
            "origin": orig,
            "destination": dest,
            "date": date,
            "total": len(results),
            "transport_options": results,
            "provider": "TripPilot Mobility Fleet",
            "data_type": "DEMO",
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

        provider_cache.set(cache_key, result, ttl_seconds=600)
        return result
