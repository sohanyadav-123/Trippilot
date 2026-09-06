from app.utils.db import get_db
from app.providers.flight_provider import MockFlightProvider
from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional

_flight_provider = MockFlightProvider()


# ── Flight Search Provider Adapter ──────────────────────────────────────────

def search_flights(origin: str, destination: str, departure_date: str,
                   return_date: Optional[str] = None, passengers: int = 1,
                   cabin_class: str = "economy", page: int = 1, per_page: int = 20,
                   sort_by: str = "recommended", filters: dict = None) -> dict:
    """
    Searches flights using the active Flight Provider (MockFlightProvider for development/demo).
    Attempts DB fallback if local records exist, otherwise generates normalized airline results.
    """
    try:
        db = get_db()
        query = {
            "origin": {"$regex": origin, "$options": "i"},
            "destination": {"$regex": destination, "$options": "i"},
            "seats_available": {"$gte": passengers},
        }

        if filters:
            if filters.get("airline"):
                query["airline"] = {"$in": filters["airline"]}
            if filters.get("stops") is not None:
                query["stops"] = filters["stops"]
            if filters.get("max_price"):
                query["price"] = {"$lte": float(filters["max_price"])}
            if filters.get("min_price"):
                query.setdefault("price", {})["$gte"] = float(filters.get("min_price", 0))

        sort_map = {
            "price": [("price", 1)],
            "cheapest": [("price", 1)],
            "duration": [("duration", 1)],
            "fastest": [("duration", 1)],
            "departure": [("departure_time", 1)],
            "earliest": [("departure_time", 1)],
            "recommended": [("price", 1), ("rating", -1)],
        }
        sort_order = sort_map.get(sort_by, [("price", 1)])

        skip = (page - 1) * per_page
        cursor = db.flights.find(query).sort(sort_order).skip(skip).limit(per_page)
        flights = list(cursor)

        if flights and len(flights) > 0:
            total = db.flights.count_documents(query)
            return {
                "provider_status": {
                    "name": "TripPilot Database Provider",
                    "status": "CONNECTED",
                    "label": "Database records",
                },
                "flights": flights,
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": max(1, -(-total // per_page)),
                "is_mock": False,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            }
    except Exception:
        pass

    # Seamless development fallback to MockFlightProvider
    return _flight_provider.search_flights(
        origin=origin,
        destination=destination,
        departure_date=departure_date,
        return_date=return_date,
        passengers=passengers,
        cabin_class=cabin_class,
        sort_by=sort_by,
        filters=filters,
    )


# ── Hotel Search Provider Adapter ───────────────────────────────────────────

def search_hotels(city: str, country: str = "", check_in: str = "", check_out: str = "",
                  guests: int = 1, rooms: int = 1, page: int = 1, per_page: int = 20,
                  sort_by: str = "recommended", filters: dict = None) -> dict:
    try:
        db = get_db()
        query = {
            "city": {"$regex": city, "$options": "i"},
            "available_rooms": {"$gte": rooms},
        }
        if country:
            query["country"] = {"$regex": country, "$options": "i"}

        if filters:
            if filters.get("max_price"):
                query["price_per_night"] = {"$lte": float(filters["max_price"])}
            if filters.get("min_price"):
                query.setdefault("price_per_night", {})["$gte"] = float(filters.get("min_price", 0))
            if filters.get("min_rating"):
                query["rating"] = {"$gte": float(filters["min_rating"])}
            if filters.get("amenities"):
                query["amenities"] = {"$all": filters["amenities"]}

        sort_map = {
            "recommended": [("rating", -1), ("price_per_night", 1)],
            "price_asc": [("price_per_night", 1)],
            "price_desc": [("price_per_night", -1)],
            "rating": [("rating", -1)],
        }
        sort_order = sort_map.get(sort_by, [("rating", -1)])

        skip = (page - 1) * per_page
        cursor = db.hotels.find(query).sort(sort_order).skip(skip).limit(per_page)
        hotels = list(cursor)

        if hotels and len(hotels) > 0:
            total = db.hotels.count_documents(query)
            return {
                "provider_status": {
                    "name": "TripPilot Stays Provider",
                    "status": "CONNECTED",
                    "label": "Verified properties",
                },
                "hotels": hotels,
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": max(1, -(-total // per_page)),
                "is_mock": False,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            }
    except Exception:
        pass

    # Realistic mock hotels fallback
    city_name = city.strip().title() or "Goa"
    mock_hotels = [
        {
            "id": f"ht-mock-1-{city_name}",
            "name": f"Taj Exotica Resort & Spa, {city_name}",
            "city": city_name,
            "country": "India",
            "rating": 4.9,
            "review_count": 520,
            "price_per_night": 14500,
            "property_type": "Resort",
            "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Beach Access", "Breakfast Included"],
            "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
            "description": "56 acres of Mediterranean-style luxury overlooking pristine shores.",
            "cancellation_policy": "Free Cancellation until 48 hours before check-in",
            "available_rooms": 4,
        },
        {
            "id": f"ht-mock-2-{city_name}",
            "name": f"The Leela Beach Palace, {city_name}",
            "city": city_name,
            "country": "India",
            "rating": 4.8,
            "review_count": 410,
            "price_per_night": 12800,
            "property_type": "Resort",
            "amenities": ["Free WiFi", "Swimming Pool", "Gym", "Ocean View", "Fine Dining"],
            "image_url": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
            "description": "Stunning coastal retreat blending Indian architectural traditions with contemporary luxury.",
            "cancellation_policy": "Free Cancellation available",
            "available_rooms": 6,
        },
        {
            "id": f"ht-mock-3-{city_name}",
            "name": f"W Hotel & Private Villas, {city_name}",
            "city": city_name,
            "country": "India",
            "rating": 4.7,
            "review_count": 330,
            "price_per_night": 10500,
            "property_type": "Hotel",
            "amenities": ["Free WiFi", "Infinity Pool", "Nightclub", "Spa"],
            "image_url": "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop&q=80",
            "description": "Vibrant beachfront escape with private beach cabanas and signature sunset parties.",
            "cancellation_policy": "Instant booking confirmation",
            "available_rooms": 3,
        },
    ]

    return {
        "provider_status": {
            "name": "TripPilot Stays Development Adapter",
            "status": "DEMO",
            "label": "Demo data • Estimated rates",
        },
        "hotels": mock_hotels,
        "total": len(mock_hotels),
        "page": page,
        "per_page": per_page,
        "pages": 1,
        "is_mock": True,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


# ── Destinations Provider ───────────────────────────────────────────────────

def search_destinations(query_str: str = "", featured: bool = False, page: int = 1, per_page: int = 20) -> dict:
    try:
        db = get_db()
        query = {}
        if query_str:
            query["$or"] = [
                {"city": {"$regex": query_str, "$options": "i"}},
                {"country": {"$regex": query_str, "$options": "i"}},
                {"tags": {"$in": [query_str.lower()]}},
            ]
        if featured:
            query["featured"] = True

        skip = (page - 1) * per_page
        cursor = db.destinations.find(query).skip(skip).limit(per_page)
        destinations = list(cursor)
        if destinations and len(destinations) > 0:
            total = db.destinations.count_documents(query)
            return {
                "destinations": destinations,
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": max(1, -(-total // per_page)),
            }
    except Exception:
        pass

    mock_destinations = [
        {"city": "Goa", "country": "India", "tag": "Sun, Sand & Beachfront Resorts", "starting_price": 3499, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80"},
        {"city": "Dubai", "country": "United Arab Emirates", "tag": "Ultra-Luxury & Desert Adventures", "starting_price": 14999, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80"},
        {"city": "Bali", "country": "Indonesia", "tag": "Tropical Villas & Sacred Temples", "starting_price": 18499, "rating": 4.9, "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80"},
        {"city": "Singapore", "country": "Singapore", "tag": "Futuristic Skyline & Gardens", "starting_price": 16999, "rating": 4.8, "image_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80"},
    ]

    return {
        "destinations": mock_destinations,
        "total": len(mock_destinations),
        "page": page,
        "per_page": per_page,
        "pages": 1,
    }


def get_destination_by_id(destination_id: str) -> Optional[dict]:
    try:
        db = get_db()
        dest = db.destinations.find_one({"_id": ObjectId(destination_id)})
        if dest:
            return dest
    except Exception:
        pass
    return {"city": destination_id, "country": "India", "tag": "Trending Holiday Destination", "starting_price": 4999, "rating": 4.8}


# ── Train Search Provider Adapter ───────────────────────────────────────────

def search_trains(origin: str, destination: str, date: str, travellers: int = 1, train_class: str = "All") -> dict:
    orig = origin or "Delhi"
    dest = destination or "Goa"
    mock_trains = [
        {
            "id": f"tr-1-{orig}-{dest}",
            "train_name": "Vande Bharat Express",
            "train_number": "22436",
            "origin": orig,
            "destination": dest,
            "departure_time": "06:00 AM",
            "arrival_time": "02:15 PM",
            "duration": "8h 15m",
            "available_classes": [
                {"class_name": "Executive Chair Car (EC)", "price": 2850, "seats": 14, "status": "Available"},
                {"class_name": "Chair Car (CC)", "price": 1650, "seats": 42, "status": "Available"},
            ],
            "rating": 4.8,
            "catering": "Complimentary Breakfast & Lunch",
            "provider": "TripPilot Rail Demo Adapter",
        },
        {
            "id": f"tr-2-{orig}-{dest}",
            "train_name": "Tejas Rajdhani Express",
            "train_number": "12952",
            "origin": orig,
            "destination": dest,
            "departure_time": "04:55 PM",
            "arrival_time": "08:35 AM",
            "duration": "15h 40m",
            "available_classes": [
                {"class_name": "1st AC (1A)", "price": 4650, "seats": 6, "status": "Available"},
                {"class_name": "2nd AC (2A)", "price": 2980, "seats": 18, "status": "Available"},
                {"class_name": "3rd AC (3A)", "price": 2150, "seats": 34, "status": "Available"},
            ],
            "rating": 4.7,
            "catering": "Dinner & Bedroll Included",
            "provider": "TripPilot Rail Demo Adapter",
        },
    ]

    return {
        "provider_status": {
            "name": "TripPilot Rail Adapter",
            "status": "DEMO",
            "label": "Demo data • Estimated fares",
        },
        "trains": mock_trains,
        "total": len(mock_trains),
        "is_mock": True,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


# ── Bus Search Provider Adapter ────────────────────────────────────────────

def search_buses(origin: str, destination: str, date: str, passengers: int = 1) -> dict:
    orig = origin or "Delhi"
    dest = destination or "Goa"
    mock_buses = [
        {
            "id": f"bus-1-{orig}-{dest}",
            "operator": "Zingbus Plus Premium",
            "bus_type": "Volvo 9600 Multi-Axle AC Sleeper (2+1)",
            "origin": orig,
            "destination": dest,
            "departure_time": "07:30 PM",
            "arrival_time": "07:00 AM",
            "duration": "11h 30m",
            "price": 1250,
            "seats_available": 12,
            "rating": 4.8,
            "amenities": ["Free WiFi", "Water Bottle", "Charging Point", "Blanket", "Live Tracking"],
            "boarding_point": "Majestic Bus Station / ISBT Gate 2",
            "dropping_point": "Main City Center Central Station",
            "provider": "TripPilot Bus Demo Adapter",
        },
        {
            "id": f"bus-2-{orig}-{dest}",
            "operator": "IntrCity SmartBus Premium Lounge",
            "bus_type": "Scania AC Multi-Axle Sleeper (2+1)",
            "origin": orig,
            "destination": dest,
            "departure_time": "09:00 PM",
            "arrival_time": "08:15 AM",
            "duration": "11h 15m",
            "price": 1420,
            "seats_available": 8,
            "rating": 4.9,
            "amenities": ["Lounge Access", "AC", "Personal LCD", "Snacks", "Sanitized Washroom"],
            "boarding_point": "SmartBus Boarding Lounge",
            "dropping_point": "City Express Terminal",
            "provider": "TripPilot Bus Demo Adapter",
        },
    ]

    return {
        "provider_status": {
            "name": "TripPilot Bus Adapter",
            "status": "DEMO",
            "label": "Demo data • Estimated fares",
        },
        "buses": mock_buses,
        "total": len(mock_buses),
        "is_mock": True,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }
