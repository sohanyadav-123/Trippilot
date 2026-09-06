"""
TripPilot AI — Seed Script
Run: python seed.py
Seeds destinations, flights, hotels, and a demo admin user.
Uses Unsplash Source URLs (free to use) for placeholder images.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime, timedelta
import bcrypt
from pymongo import MongoClient
from config import current_config
import certifi
import random

kwargs = {}
if "mongodb+srv" in current_config.MONGO_URI or "ssl=true" in current_config.MONGO_URI.lower() or "tls=true" in current_config.MONGO_URI.lower():
    kwargs["tlsCAFile"] = certifi.where()

client = MongoClient(current_config.MONGO_URI, **kwargs)
db = client[current_config.DB_NAME]

print(f"🔗 Connected to MongoDB: {current_config.DB_NAME}")

# ── Clear existing seed data ─────────────────────────────────────────────────
print("🧹 Clearing existing data...")
db.destinations.delete_many({})
db.flights.delete_many({})
db.hotels.delete_many({})
db.users.delete_many({"email": {"$in": ["admin@trippilot.ai", "demo@trippilot.ai"]}})
db.offers.delete_many({})

# ── Destinations ─────────────────────────────────────────────────────────────
print("🌍 Seeding destinations...")

destinations = [
    {
        "country": "India", "city": "Goa",
        "description": "India's beach paradise with golden sands, Portuguese architecture, spicy seafood, and vibrant nightlife.",
        "image_url": "https://images.unsplash.com/photo-1587922546307-776227941871?w=800",
        "tags": ["beach", "party", "heritage", "seafood", "water-sports"],
        "attractions": ["Baga Beach", "Calangute Beach", "Basilica of Bom Jesus", "Dudhsagar Falls", "Anjuna Flea Market"],
        "average_daily_budget": 3500,
        "featured": True, "currency": "INR",
        "best_time": "November to February",
        "weather": "Tropical, 25–35°C",
    },
    {
        "country": "India", "city": "Delhi",
        "description": "India's capital — a city of Mughal grandeur, street food legends, and world-class museums.",
        "image_url": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
        "tags": ["heritage", "food", "culture", "history", "museums"],
        "attractions": ["Red Fort", "Qutub Minar", "India Gate", "Lotus Temple", "Chandni Chowk"],
        "average_daily_budget": 3000,
        "featured": True, "currency": "INR",
        "best_time": "October to March",
        "weather": "Continental, 5–45°C",
    },
    {
        "country": "India", "city": "Mumbai",
        "description": "India's maximum city — Bollywood glam, Marine Drive sunsets, and the best vada pav in the world.",
        "image_url": "https://images.unsplash.com/photo-1562979314-bee7453e911c?w=800",
        "tags": ["bollywood", "beaches", "food", "nightlife", "business"],
        "attractions": ["Gateway of India", "Marine Drive", "Elephanta Caves", "Juhu Beach", "Dharavi"],
        "average_daily_budget": 4000,
        "featured": True, "currency": "INR",
        "best_time": "November to February",
        "weather": "Tropical, 17–35°C",
    },
    {
        "country": "India", "city": "Kerala",
        "description": "God's Own Country — backwaters, Ayurveda spas, elephant sanctuaries, and misty hill stations.",
        "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
        "tags": ["backwaters", "nature", "ayurveda", "wildlife", "yoga"],
        "attractions": ["Alleppey Backwaters", "Munnar Tea Gardens", "Periyar Wildlife Sanctuary", "Kovalam Beach", "Thekkady"],
        "average_daily_budget": 3200,
        "featured": True, "currency": "INR",
        "best_time": "September to March",
        "weather": "Tropical, 20–33°C",
    },
    {
        "country": "India", "city": "Manali",
        "description": "Himalayan adventure capital — snow peaks, river rafting, paragliding, and cozy cafés.",
        "image_url": "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
        "tags": ["mountains", "adventure", "snow", "trekking", "camping"],
        "attractions": ["Rohtang Pass", "Solang Valley", "Hadimba Temple", "Old Manali", "Beas Kund Trek"],
        "average_daily_budget": 2800,
        "featured": True, "currency": "INR",
        "best_time": "October to June (avoid monsoon)",
        "weather": "Alpine, -10°C to 25°C",
    },
    {
        "country": "UAE", "city": "Dubai",
        "description": "A city of superlatives — the world's tallest building, largest mall, and most extravagant experiences.",
        "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
        "tags": ["luxury", "shopping", "skyscrapers", "desert", "beach"],
        "attractions": ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Desert Safari", "Dubai Creek"],
        "average_daily_budget": 12000,
        "featured": True, "currency": "AED",
        "best_time": "November to March",
        "weather": "Desert, 15–45°C",
    },
    {
        "country": "Thailand", "city": "Bangkok",
        "description": "Southeast Asia's most electrifying city — ornate temples, legendary street food, and rooftop bars.",
        "image_url": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
        "tags": ["temples", "street-food", "nightlife", "shopping", "culture"],
        "attractions": ["Grand Palace", "Wat Pho", "Chatuchak Market", "Khao San Road", "Chao Phraya River"],
        "average_daily_budget": 4500,
        "featured": True, "currency": "THB",
        "best_time": "November to February",
        "weather": "Tropical, 25–38°C",
    },
    {
        "country": "Singapore", "city": "Singapore",
        "description": "Asia's most modern city-state — Gardens by the Bay, hawker centres, and extraordinary efficiency.",
        "image_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
        "tags": ["modern", "food", "gardens", "family", "shopping"],
        "attractions": ["Gardens by the Bay", "Marina Bay Sands", "Sentosa Island", "Universal Studios", "Clarke Quay"],
        "average_daily_budget": 9000,
        "featured": True, "currency": "SGD",
        "best_time": "February to April",
        "weather": "Tropical, 24–34°C",
    },
    {
        "country": "France", "city": "Paris",
        "description": "The City of Light — romance, haute cuisine, world-class art, and the iconic Eiffel Tower.",
        "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
        "tags": ["romance", "art", "food", "fashion", "history"],
        "attractions": ["Eiffel Tower", "Louvre Museum", "Notre Dame Cathedral", "Champs-Élysées", "Montmartre"],
        "average_daily_budget": 15000,
        "featured": True, "currency": "EUR",
        "best_time": "April to June, September to October",
        "weather": "Temperate, 5–25°C",
    },
    {
        "country": "Japan", "city": "Tokyo",
        "description": "A city where futurism meets tradition — neon lights, cherry blossoms, sushi, and anime culture.",
        "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
        "tags": ["culture", "food", "technology", "anime", "gardens"],
        "attractions": ["Shibuya Crossing", "Mount Fuji", "Senso-ji Temple", "Akihabara", "Shinjuku Gyoen"],
        "average_daily_budget": 11000,
        "featured": True, "currency": "JPY",
        "best_time": "March to May (cherry blossom) or October to November",
        "weather": "Temperate, 0–35°C",
    },
    {
        "country": "United Kingdom", "city": "London",
        "description": "Where history and cosmopolitan culture collide — royalty, red buses, world-class museums, and theatre.",
        "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
        "tags": ["history", "theatre", "museums", "royal", "culture"],
        "attractions": ["Tower of London", "British Museum", "Buckingham Palace", "Hyde Park", "The Shard"],
        "average_daily_budget": 16000,
        "featured": True, "currency": "GBP",
        "best_time": "May to September",
        "weather": "Maritime, 5–22°C",
    },
    {
        "country": "United States", "city": "New York",
        "description": "The city that never sleeps — Times Square, Broadway, Central Park, and the Statue of Liberty.",
        "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
        "tags": ["urban", "culture", "shopping", "broadway", "iconic"],
        "attractions": ["Times Square", "Central Park", "Statue of Liberty", "Metropolitan Museum", "Brooklyn Bridge"],
        "average_daily_budget": 18000,
        "featured": True, "currency": "USD",
        "best_time": "April to June, September to November",
        "weather": "Continental, -5°C to 32°C",
    },
]

for d in destinations:
    d["created_at"] = datetime.utcnow()

dest_result = db.destinations.insert_many(destinations)
print(f"   ✅ {len(dest_result.inserted_ids)} destinations inserted")

# ── Flights ──────────────────────────────────────────────────────────────────
print("✈️  Seeding flights...")

def make_departure(days_offset, hour, minute=0):
    base = datetime.utcnow().replace(hour=hour, minute=minute, second=0, microsecond=0)
    return base + timedelta(days=days_offset)

airlines = ["IndiGo", "Air India", "SpiceJet", "Vistara", "GoFirst", "Emirates", "Singapore Airlines", "Thai Airways", "British Airways", "Air France"]

routes = [
    ("Delhi", "Goa", 2200, 2.5),
    ("Mumbai", "Goa", 1800, 1.25),
    ("Delhi", "Mumbai", 3500, 2.0),
    ("Delhi", "Kerala", 5500, 3.0),
    ("Mumbai", "Kerala", 4200, 2.25),
    ("Delhi", "Manali", 1200, 1.5),
    ("Mumbai", "Delhi", 3800, 2.0),
    ("Delhi", "Dubai", 12000, 3.5),
    ("Mumbai", "Dubai", 10000, 3.25),
    ("Delhi", "Bangkok", 14000, 4.5),
    ("Mumbai", "Bangkok", 13000, 4.25),
    ("Delhi", "Singapore", 18000, 5.5),
    ("Mumbai", "Singapore", 16500, 5.25),
    ("Delhi", "Paris", 45000, 8.5),
    ("Mumbai", "London", 48000, 9.0),
    ("Delhi", "Tokyo", 38000, 8.0),
    ("Mumbai", "New York", 55000, 14.5),
]

flights = []
for i, (origin, dest, base_price, duration_hours) in enumerate(routes):
    airline = airlines[i % len(airlines)]
    for day_offset in [3, 7, 10, 14, 21]:
        for hour in [6, 9, 14, 19]:
            price_variation = random.randint(-1000, 2000)
            departure = make_departure(day_offset, hour)
            arrival = departure + timedelta(hours=duration_hours)
            flights.append({
                "airline": airline,
                "flight_number": f"{airline[:2].upper()}{random.randint(100, 999)}",
                "origin": origin,
                "destination": dest,
                "departure_time": departure,
                "arrival_time": arrival,
                "duration": duration_hours,
                "stops": 0 if duration_hours < 4 else random.choice([0, 1]),
                "cabin_class": "economy",
                "price": max(1000, base_price + price_variation),
                "seats_available": random.randint(5, 120),
                "baggage_policy": "15 kg check-in, 7 kg cabin",
                "cancellation_policy": "Free cancellation 24h before departure",
                "created_at": datetime.utcnow(),
            })

flights_result = db.flights.insert_many(flights)
print(f"   ✅ {len(flights_result.inserted_ids)} flights inserted")

# ── Hotels ───────────────────────────────────────────────────────────────────
print("🏨 Seeding hotels...")

hotel_data = [
    # Goa
    {"name": "The Leela Goa", "city": "Goa", "country": "India", "price_per_night": 12000, "rating": 4.8,
     "image_urls": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
     "amenities": ["Pool", "Spa", "Beach Access", "Restaurant", "WiFi", "Gym"],
     "description": "Luxury beachfront resort with private beach and world-class spa."},
    {"name": "Cidade de Goa", "city": "Goa", "country": "India", "price_per_night": 7500, "rating": 4.5,
     "image_urls": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"],
     "amenities": ["Pool", "Restaurant", "Beach Access", "WiFi", "Bar"],
     "description": "Heritage resort blending Portuguese architecture with modern comforts."},
    {"name": "Casa Vagator Beach Resort", "city": "Goa", "country": "India", "price_per_night": 3500, "rating": 4.1,
     "image_urls": ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"],
     "amenities": ["Pool", "WiFi", "Restaurant", "Beach View"],
     "description": "Charming boutique resort near Vagator Beach."},

    # Delhi
    {"name": "The Imperial New Delhi", "city": "Delhi", "country": "India", "price_per_night": 15000, "rating": 4.9,
     "image_urls": ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"],
     "amenities": ["Pool", "Spa", "Multiple Restaurants", "WiFi", "Gym", "Concierge"],
     "description": "Delhi's most iconic heritage luxury hotel since 1931."},
    {"name": "Taj Mahal Hotel Delhi", "city": "Delhi", "country": "India", "price_per_night": 13000, "rating": 4.7,
     "image_urls": ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"],
     "amenities": ["Pool", "Spa", "Restaurant", "WiFi", "Business Center"],
     "description": "Grand luxury hotel in the heart of New Delhi."},
    {"name": "Bloom Hotel Janpath", "city": "Delhi", "country": "India", "price_per_night": 3200, "rating": 4.2,
     "image_urls": ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"],
     "amenities": ["WiFi", "Restaurant", "24h Front Desk", "Air Conditioning"],
     "description": "Modern budget-friendly hotel centrally located."},

    # Mumbai
    {"name": "The Taj Mahal Palace Mumbai", "city": "Mumbai", "country": "India", "price_per_night": 20000, "rating": 4.9,
     "image_urls": ["https://images.unsplash.com/photo-1572894082506-bb0a4ae7ba34?w=800"],
     "amenities": ["Pool", "Spa", "Fine Dining", "Sea View", "Gym", "Concierge"],
     "description": "Mumbai's legendary heritage hotel overlooking the Gateway of India."},
    {"name": "Trident Nariman Point", "city": "Mumbai", "country": "India", "price_per_night": 11000, "rating": 4.6,
     "image_urls": ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"],
     "amenities": ["Pool", "Spa", "Restaurant", "WiFi", "Sea View"],
     "description": "Stylish hotel with panoramic Marine Drive views."},

    # Kerala
    {"name": "Kumarakom Lake Resort", "city": "Kerala", "country": "India", "price_per_night": 18000, "rating": 4.9,
     "image_urls": ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"],
     "amenities": ["Backwater View", "Ayurveda Spa", "Pool", "Restaurant", "Yoga", "WiFi"],
     "description": "Award-winning luxury resort on Vembanad Lake with traditional Kerala architecture."},
    {"name": "Coconut Lagoon CGH Earth", "city": "Kerala", "country": "India", "price_per_night": 9500, "rating": 4.7,
     "image_urls": ["https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800"],
     "amenities": ["Backwater Access", "Ayurveda", "Restaurant", "Kayaking", "WiFi"],
     "description": "Eco-luxury resort accessible only by boat in Kumarakom."},

    # Manali
    {"name": "Span Resort & Spa Manali", "city": "Manali", "country": "India", "price_per_night": 8000, "rating": 4.6,
     "image_urls": ["https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800"],
     "amenities": ["Spa", "Mountain View", "Restaurant", "WiFi", "Adventure Activities"],
     "description": "Riverside resort with stunning Kullu Valley views."},
    {"name": "Johnson's Hotel Manali", "city": "Manali", "country": "India", "price_per_night": 2800, "rating": 4.1,
     "image_urls": ["https://images.unsplash.com/photo-1544298621-a01a5b89a2f1?w=800"],
     "amenities": ["WiFi", "Restaurant", "Mountain View", "Heater"],
     "description": "Charming colonial-era hotel in Old Manali."},

    # Dubai
    {"name": "Burj Al Arab Jumeirah", "city": "Dubai", "country": "UAE", "price_per_night": 80000, "rating": 5.0,
     "image_urls": ["https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800"],
     "amenities": ["Private Beach", "Multiple Pools", "Michelin Dining", "Butler Service", "Helipad"],
     "description": "The world's most luxurious hotel — an iconic sail-shaped skyscraper."},
    {"name": "Atlantis The Palm Dubai", "city": "Dubai", "country": "UAE", "price_per_night": 35000, "rating": 4.7,
     "image_urls": ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"],
     "amenities": ["Aquaventure Waterpark", "Private Beach", "Multiple Pools", "Casino", "Spa"],
     "description": "Iconic resort on the Palm with an epic waterpark."},
    {"name": "Rove Downtown Dubai", "city": "Dubai", "country": "UAE", "price_per_night": 9500, "rating": 4.3,
     "image_urls": ["https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800"],
     "amenities": ["Pool", "Gym", "Restaurant", "WiFi", "Burj Khalifa View"],
     "description": "Trendy mid-range hotel near the Dubai Mall."},

    # Bangkok
    {"name": "Mandarin Oriental Bangkok", "city": "Bangkok", "country": "Thailand", "price_per_night": 22000, "rating": 4.9,
     "image_urls": ["https://images.unsplash.com/photo-1455587734955-081b22074882?w=800"],
     "amenities": ["Riverside Pool", "Spa", "Fine Dining", "Cooking Classes", "WiFi"],
     "description": "Bangkok's legendary riverside luxury hotel since 1876."},
    {"name": "COMO Metropolitan Bangkok", "city": "Bangkok", "country": "Thailand", "price_per_night": 12000, "rating": 4.6,
     "image_urls": ["https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800"],
     "amenities": ["Pool", "Spa", "Restaurant", "WiFi", "Gym"],
     "description": "Sleek urban retreat in the heart of Bangkok."},

    # Singapore
    {"name": "Marina Bay Sands", "city": "Singapore", "country": "Singapore", "price_per_night": 45000, "rating": 4.8,
     "image_urls": ["https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800"],
     "amenities": ["Infinity Pool", "Casino", "Multiple Restaurants", "Spa", "Shopping Mall"],
     "description": "Singapore's most iconic hotel with the world-famous rooftop infinity pool."},
    {"name": "The Fullerton Hotel Singapore", "city": "Singapore", "country": "Singapore", "price_per_night": 28000, "rating": 4.7,
     "image_urls": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"],
     "amenities": ["Pool", "Spa", "Restaurant", "WiFi", "Heritage Building"],
     "description": "Legendary heritage hotel in the former General Post Office."},

    # Paris
    {"name": "Le Meurice Paris", "city": "Paris", "country": "France", "price_per_night": 70000, "rating": 5.0,
     "image_urls": ["https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800"],
     "amenities": ["Michelin Restaurant", "Spa", "Bar", "WiFi", "Concierge", "Eiffel View"],
     "description": "Palace hotel that has hosted royalty and artists since 1835."},
    {"name": "Hôtel des Arts Montmartre", "city": "Paris", "country": "France", "price_per_night": 18000, "rating": 4.4,
     "image_urls": ["https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800"],
     "amenities": ["WiFi", "Breakfast", "Art Decor", "Central Location"],
     "description": "Charming boutique hotel in bohemian Montmartre."},

    # Tokyo
    {"name": "Aman Tokyo", "city": "Tokyo", "country": "Japan", "price_per_night": 75000, "rating": 5.0,
     "image_urls": ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800"],
     "amenities": ["Pool", "Spa", "Fine Dining", "Tea Ceremony", "Zen Garden", "WiFi"],
     "description": "Ultra-luxury urban sanctuary in Otemachi with stunning Tokyo views."},
    {"name": "Shinjuku Granbell Hotel", "city": "Tokyo", "country": "Japan", "price_per_night": 12000, "rating": 4.3,
     "image_urls": ["https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800"],
     "amenities": ["WiFi", "Restaurant", "Rooftop Bar", "City View"],
     "description": "Stylish boutique hotel in the heart of Shinjuku."},

    # London
    {"name": "The Savoy London", "city": "London", "country": "United Kingdom", "price_per_night": 65000, "rating": 4.9,
     "image_urls": ["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"],
     "amenities": ["Pool", "Spa", "Multiple Restaurants", "Thames View", "Concierge"],
     "description": "London's grandest hotel on the Strand since 1889."},
    {"name": "citizenM Tower of London Hotel", "city": "London", "country": "United Kingdom", "price_per_night": 18000, "rating": 4.5,
     "image_urls": ["https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800"],
     "amenities": ["24h Living Room", "WiFi", "Tower of London View", "Self Check-in"],
     "description": "Smart designer hotel right next to the Tower of London."},

    # New York
    {"name": "The Plaza Hotel New York", "city": "New York", "country": "United States", "price_per_night": 85000, "rating": 4.8,
     "image_urls": ["https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800"],
     "amenities": ["Spa", "Fine Dining", "Concierge", "Central Park View", "WiFi", "Gym"],
     "description": "The most famous hotel in New York since 1907, overlooking Central Park."},
    {"name": "Pod 51 Hotel New York", "city": "New York", "country": "United States", "price_per_night": 15000, "rating": 4.1,
     "image_urls": ["https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800"],
     "amenities": ["WiFi", "Rooftop Bar", "Compact Rooms", "Central Location"],
     "description": "Affordable micro-hotel in Midtown Manhattan."},
]

for h in hotel_data:
    h.setdefault("address", f"{h['city']}, {h['country']}")
    h.setdefault("available_rooms", random.randint(10, 50))
    h.setdefault("cancellation_policy", "Free cancellation 48 hours before check-in")
    h.setdefault("room_types", ["Standard", "Deluxe", "Suite"])
    h["created_at"] = datetime.utcnow()

hotels_result = db.hotels.insert_many(hotel_data)
print(f"   ✅ {len(hotels_result.inserted_ids)} hotels inserted")

# ── Users ────────────────────────────────────────────────────────────────────
print("👤 Seeding users...")

admin_password = bcrypt.hashpw("Admin@123456".encode(), bcrypt.gensalt()).decode()
demo_password = bcrypt.hashpw("Demo@123456".encode(), bcrypt.gensalt()).decode()

users = [
    {
        "name": "TripPilot Admin",
        "email": "admin@trippilot.ai",
        "password_hash": admin_password,
        "phone": "+919876543210",
        "role": "admin",
        "preferences": {"currency": "INR", "notifications": True, "travel_style": ["luxury", "adventure"]},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "name": "Demo Traveller",
        "email": "demo@trippilot.ai",
        "password_hash": demo_password,
        "phone": "+919876543211",
        "role": "user",
        "preferences": {"currency": "INR", "notifications": True, "travel_style": ["budget", "backpacker"]},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
]

users_result = db.users.insert_many(users)
print(f"   ✅ {len(users_result.inserted_ids)} users inserted")

# ── Offers ───────────────────────────────────────────────────────────────────
print("🎁 Seeding promotional offers...")

offers = [
    {
        "code": "PILOT20", "title": "20% Off Your First Booking", "description": "Get 20% off on your first flight or hotel booking with TripPilot AI.",
        "discount_type": "percentage", "discount_value": 20, "max_discount": 5000,
        "min_booking_amount": 5000, "valid_from": datetime.utcnow(), "valid_until": datetime.utcnow() + timedelta(days=90),
        "applicable_to": ["flights", "hotels"], "active": True, "created_at": datetime.utcnow(),
    },
    {
        "code": "GOABEACH", "title": "₹2000 Off Goa Hotels", "description": "Flat ₹2000 off on all Goa hotel bookings.",
        "discount_type": "flat", "discount_value": 2000, "max_discount": 2000,
        "min_booking_amount": 8000, "valid_from": datetime.utcnow(), "valid_until": datetime.utcnow() + timedelta(days=30),
        "applicable_to": ["hotels"], "active": True, "created_at": datetime.utcnow(),
    },
    {
        "code": "FLYAWAY15", "title": "15% Off International Flights", "description": "Save 15% on all international flight bookings.",
        "discount_type": "percentage", "discount_value": 15, "max_discount": 8000,
        "min_booking_amount": 15000, "valid_from": datetime.utcnow(), "valid_until": datetime.utcnow() + timedelta(days=60),
        "applicable_to": ["flights"], "active": True, "created_at": datetime.utcnow(),
    },
]

db.offers.insert_many(offers)
print(f"   ✅ {len(offers)} offers inserted")

print("\n✨ Seed complete!")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"  Database : {current_config.DB_NAME}")
print(f"  Admin    : admin@trippilot.ai / Admin@123456")
print(f"  Demo     : demo@trippilot.ai / Demo@123456")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
