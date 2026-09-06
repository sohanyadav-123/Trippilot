import random
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone
from app.providers.base_provider import TrainProvider, ProviderStatus, provider_cache

TRAIN_SCHEDULES_DB = [
    {
        "train_number": "22229",
        "train_name": "Goa Vande Bharat Express",
        "origin": "Mumbai CSMT",
        "destination": "Madgaon (Goa)",
        "departure_time": "05:25",
        "arrival_time": "13:10",
        "duration": "7h 45m",
        "duration_minutes": 465,
        "runs_on": ["Mon", "Wed", "Fri", "Sat", "Sun"],
        "classes": [
            {"code": "CC", "name": "AC Chair Car", "price": 1815, "seats_available": 42, "status": "AVAILABLE"},
            {"code": "EC", "name": "Executive Class", "price": 3355, "seats_available": 14, "status": "AVAILABLE"},
        ],
    },
    {
        "train_number": "12051",
        "train_name": "Jan Shatabdi Express",
        "origin": "Mumbai CSMT",
        "destination": "Madgaon (Goa)",
        "departure_time": "05:10",
        "arrival_time": "14:15",
        "duration": "9h 05m",
        "duration_minutes": 545,
        "runs_on": ["Daily"],
        "classes": [
            {"code": "2S", "name": "Second Seating", "price": 315, "seats_available": 85, "status": "AVAILABLE"},
            {"code": "CC", "name": "AC Chair Car", "price": 1090, "seats_available": 28, "status": "AVAILABLE"},
            {"code": "EV", "name": "Vistadome AC", "price": 2495, "seats_available": 6, "status": "RAC 4"},
        ],
    },
    {
        "train_number": "12450",
        "train_name": "Goa Sampark Kranti Express",
        "origin": "New Delhi",
        "destination": "Madgaon (Goa)",
        "departure_time": "06:15",
        "arrival_time": "11:30 (+1 day)",
        "duration": "29h 15m",
        "duration_minutes": 1755,
        "runs_on": ["Mon", "Sat"],
        "classes": [
            {"code": "SL", "name": "Sleeper", "price": 860, "seats_available": 12, "status": "AVAILABLE"},
            {"code": "3A", "name": "AC 3 Tier", "price": 2240, "seats_available": 18, "status": "AVAILABLE"},
            {"code": "2A", "name": "AC 2 Tier", "price": 3280, "seats_available": 8, "status": "AVAILABLE"},
            {"code": "1A", "name": "AC 1st Class", "price": 5560, "seats_available": 4, "status": "AVAILABLE"},
        ],
    },
]


class MockTrainProvider(TrainProvider):
    """Realistic Railway Network Provider in Demo/Sandbox Mode."""

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "Indian Railways IRCTC Adapter",
            "category": "Trains",
            "status": ProviderStatus.DEMO,
            "data_type": "DEMO",
            "is_live": False,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "IRCTC-modeled train schedules, class fares (Vande Bharat, Rajdhani, Shatabdi), and seat availability.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        return True, "Mock train schedules operational", 1

    def search_trains(self, origin: str, destination: str, date: str) -> Dict[str, Any]:
        orig = origin.strip().title() or "Mumbai"
        dest = destination.strip().title() or "Goa"

        cache_key = f"trains_{orig}_{dest}_{date}"
        cached = provider_cache.get(cache_key)
        if cached:
            return cached

        trains = []
        for t in TRAIN_SCHEDULES_DB:
            trains.append({
                "train_number": t["train_number"],
                "train_name": t["train_name"],
                "origin": orig,
                "destination": dest,
                "departure_time": t["departure_time"],
                "arrival_time": t["arrival_time"],
                "duration": t["duration"],
                "duration_minutes": t["duration_minutes"],
                "travel_date": date,
                "classes": t["classes"],
                "provider": "TripPilot Railway Simulator",
                "source": "SIMULATED_RAIL_SCHEDULE",
                "data_type": "DEMO",
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })

        result = {
            "origin": orig,
            "destination": dest,
            "date": date,
            "total": len(trains),
            "trains": trains,
            "provider": "TripPilot Railway Simulator",
            "data_type": "DEMO",
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

        provider_cache.set(cache_key, result, ttl_seconds=600)
        return result
