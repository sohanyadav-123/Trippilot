"""
TripPilot Places & Hidden Gems Service.
Provides comprehensive, high-depth local intelligence for hidden places,
offbeat attractions, viewpoints, local cuisine spots, and secret experiences.
"""
from typing import List, Dict, Any, Optional

# Curated high-depth dataset of hidden places across key destinations
HIDDEN_PLACES_DATA: List[Dict[str, Any]] = [
    # ── GOA ──
    {
        "id": "goa-kakolem-beach",
        "name": "Kakolem Beach (Tiger Beach)",
        "destination": "Goa",
        "region": "South Goa (Canacona/Cola area)",
        "category": "Secluded Beach & Natural Spring",
        "why_worth_visiting": "A dramatic hidden crescent beach flanked by sheer cliffs with a freshwater waterfall and spring cascading directly onto the golden sands into the Arabian Sea.",
        "why_less_touristy": "Requires a 15-minute steep downhill trek via an unpaved cliff trail; no vehicular access or commercial beach shacks.",
        "best_time_to_visit": "Early morning (07:30 AM – 11:00 AM) or sunset (04:30 PM – 06:30 PM). Avoid peak monsoon.",
        "how_to_reach": "Drive along NH66 toward Cola, South Goa. Look for the small roadside wooden marker, park at the cliff top, and take the downhill footpath.",
        "distance": "Approx. 32 km from Margao, 68 km from Panaji",
        "travel_time": "1 hr 15 mins drive from Margao; 15 mins footpath hike",
        "entry_fee": 0,
        "parking": "Free cliff-edge parking for scooters and small cars",
        "activities": ["Freshwater spring dip", "Cliffside photography", "Tide-pool exploring", "Quiet sunset watching"],
        "nearby_attractions": ["Cola Beach & Blue Lagoon (8 km)", "Cabo de Rama Fort (14 km)"],
        "food_options": "One rustic cliffside family stall serving fresh coconut water, cold drinks, and Goan fish thali on request.",
        "safety_tips": "Strong undertow currents during high tide; swimming deep is not advised. Wear gripped shoes for the descent.",
        "crowd_level": "Very Low (typically 5–15 visitors at any time)",
        "recommended_duration": "2.5 to 3.5 hours",
        "approximate_cost": "₹200 – ₹500 per person (parking + snacks)",
        "suitability_couples": "High (peaceful, romantic, extremely scenic)",
        "suitability_families": "Moderate (rocky trail requires careful walking for children)",
        "tags": ["beach", "hidden", "waterfall", "nature", "sunset", "romantic"]
    },
    {
        "id": "goa-galgibaga-beach",
        "name": "Galgibaga Beach (Turtle Beach)",
        "destination": "Goa",
        "region": "South Goa (Canacona)",
        "category": "Pristine Marine Sanctuary & Pine Groves",
        "why_worth_visiting": "Miles of silver sand, casuarina pine tree canopy, absolute tranquility, and an official Olive Ridley turtle nesting conservation reserve.",
        "why_less_touristy": "Strict environmental protections prohibit loud music, permanent concrete shacks, and water scooters, preserving raw coastal nature.",
        "best_time_to_visit": "04:00 PM – 07:00 PM for calm breezes and vivid pink sunsets; December–February for turtle nesting season.",
        "how_to_reach": "Cross the Galgibaga river bridge on Maxem road south of Chaudi, Canacona.",
        "distance": "18 km south of Palolem, 78 km from Dabolim Airport",
        "travel_time": "30 mins from Palolem, 1.5 hrs from Margao",
        "entry_fee": 0,
        "parking": "Roadside shaded parking under pine trees (Free)",
        "activities": ["Turtle conservation information", "Pine grove reading & relaxing", "Quiet seaside strolling", "Bird watching along the estuary"],
        "nearby_attractions": ["Talpona Beach (4 km)", "Sadolxem Wooden Suspension Bridge (6 km)"],
        "food_options": "Renowned local sea shacks like Surya's Shack serving freshly caught butter-garlic crab and river oysters.",
        "safety_tips": "Follow sanctuary guidelines: do not flash lights at night, keep dogs leashed, and avoid disturbing marked turtle nests.",
        "crowd_level": "Very Low (empty stretches of pristine sand)",
        "recommended_duration": "2 to 3 hours",
        "approximate_cost": "₹300 – ₹700 per person (seafood lunch/dinner)",
        "suitability_couples": "Very High (intimate, peaceful atmosphere)",
        "suitability_families": "High (clean sand, gentle waters near the river mouth)",
        "tags": ["beach", "wildlife", "turtles", "peaceful", "seafood"]
    },
    {
        "id": "goa-fontainhas-bakeries",
        "name": "Fontainhas Latin Quarter Hidden Bakery & Heritage Trail",
        "destination": "Goa",
        "region": "Panaji, North/Central Goa",
        "category": "Heritage, Architecture & Artisan Bakeries",
        "why_worth_visiting": "Asia's only preserved Latin Quarter with 18th-century Portuguese pastel villas, azulejo hand-painted ceramic tiles, and century-old family wood-fired bakeries.",
        "why_less_touristy": "Most tourists rush to Baga/Calangute; the quiet cobblestone alleys of Fontainhas offer relaxed, authentic Indo-Portuguese living culture.",
        "best_time_to_visit": "08:00 AM – 10:30 AM (when bakeries take fresh bread out of wood ovens) or 04:30 PM – 07:00 PM.",
        "how_to_reach": "Located at the foot of Altinho hill in central Panaji, easily reached by cab, bus, or two-wheeler.",
        "distance": "3 km from Miramar Beach, 30 km from Dabolim Airport",
        "travel_time": "10 mins from Panaji Bus Stand",
        "entry_fee": 0,
        "parking": "Designated municipal parking lot near Ourem Creek (₹20/hr)",
        "activities": ["Wood-fired bakery sampling", "Heritage villa photography", "Art gallery visits (Gitanjali Gallery)", "Bebinca & Poee bread tasting"],
        "nearby_attractions": ["Maruti Temple Altinho Viewpoint (500m)", "Immaculate Conception Church (800m)"],
        "food_options": "Confeitaria 31 de Janeiro (historic 1930 bakery famous for warm Poee bread and almond pastel de nata), Joseph Bar, and Viva Panjim.",
        "safety_tips": "Residential neighborhood; please maintain low volume and respect residents' privacy.",
        "crowd_level": "Low to Moderate (leisurely walkers and photographers)",
        "recommended_duration": "2 to 3 hours",
        "approximate_cost": "₹150 – ₹400 for bakery treats and coffee",
        "suitability_couples": "Very High (romantic old-world European charm)",
        "suitability_families": "Very High (flat cobblestone streets, delicious pastries for kids)",
        "tags": ["heritage", "culture", "food", "photography", "panaji"]
    },
    {
        "id": "goa-harvalem-caves",
        "name": "Harvalem (Arvalem) Rock-Cut Caves & Waterfall",
        "destination": "Goa",
        "region": "Bicholim, North-East Goa",
        "category": "Ancient Heritage & Secluded Waterfall",
        "why_worth_visiting": "6th-century rock-cut Buddhist/Pandava caves carved into laterite rock alongside the tranquil 50-foot cascading Harvalem Waterfall.",
        "why_less_touristy": "Situated in the lush interior hinterlands of Goa away from the coastal tourist belt.",
        "best_time_to_visit": "10:00 AM – 04:00 PM; Waterfall is most majestic during and immediately following monsoon (August–November).",
        "how_to_reach": "Drive through Sanquelim toward Bicholim in North Goa.",
        "distance": "32 km from Panaji, 40 km from Calangute",
        "travel_time": "50 mins drive from Panaji",
        "entry_fee": 0,
        "parking": "Spacious free parking at the entrance",
        "activities": ["Ancient cave exploration", "Waterfall viewpoint", "Rudrareshwar temple visit", "Nature photography"],
        "nearby_attractions": ["Mayem Lake (9 km)", "Tambdi Surla Mahadev Temple (35 km)"],
        "food_options": "Local Konkani vegetarian and fish thali eateries near Sanquelim town market.",
        "safety_tips": "Rocks near the waterfall spray can be slippery; swimming is restricted during heavy currents.",
        "crowd_level": "Low (predominantly local visitors)",
        "recommended_duration": "1.5 to 2 hours",
        "approximate_cost": "₹100 – ₹250 per person",
        "suitability_couples": "High (peaceful nature escape)",
        "suitability_families": "High (educational historic caves with pleasant park surroundings)",
        "tags": ["waterfall", "heritage", "history", "nature", "temple"]
    },
    {
        "id": "goa-chorão-island",
        "name": "Chorão Island & Dr. Salim Ali Mangrove Bird Sanctuary",
        "destination": "Goa",
        "region": "Mandovi River, North Goa",
        "category": "Eco-Tourism & Mangrove Safari",
        "why_worth_visiting": "A serene riverine island reached by traditional vehicle ferry, home to dense estuarine mangrove forests teeming with kingfishers, flying foxes, and marsh crocodiles.",
        "why_less_touristy": "Island geography requires a river ferry crossing; visited mainly by birdwatchers and nature enthusiasts.",
        "best_time_to_visit": "06:30 AM – 09:30 AM during low tide for maximum bird sightings and active wildlife.",
        "how_to_reach": "Drive to Ribandar Ferry Wharf (5 km east of Panaji) and take the free vehicle ferry across to Chorão Island.",
        "distance": "7 km from Panaji city center",
        "travel_time": "15 mins drive to ferry + 10 mins pleasant ferry ride",
        "entry_fee": 20,
        "parking": "Free parking at the sanctuary entrance jetty",
        "activities": ["Silent electric boat mangrove safari", "Birdwatching tower", "Cycling through heritage whitewashed villages", "Old Portuguese chapel trails"],
        "nearby_attractions": ["Divar Island (via another short ferry)", "Old Goa Churches (5 km from Ribandar)"],
        "food_options": "Small village tea stalls offering hot mirchi pakoras, samosas, and chai.",
        "safety_tips": "Carry mosquito repellent and binoculars; stay seated inside the boat during mangrove channels.",
        "crowd_level": "Very Low (peaceful early mornings)",
        "recommended_duration": "2.5 to 3.5 hours",
        "approximate_cost": "₹150 – ₹400 for entry and boat tour",
        "suitability_couples": "High (peaceful nature escape)",
        "suitability_families": "Very High (exciting boat safari and wildlife sightings for kids)",
        "tags": ["wildlife", "birds", "nature", "island", "safari"]
    },

    # ── MANALI ──
    {
        "id": "manali-jana-waterfall",
        "name": "Jana Waterfall & Traditional Himachali Woodfire Kitchen",
        "destination": "Manali",
        "region": "Naggar Valley, Kullu-Manali",
        "category": "Alpine Waterfall & Authentic Village Gastronomy",
        "why_worth_visiting": "A clear mountain cascade nestled within deodar pine forests where local village cooks prepare woodfire-steamed Siddu with ghee, red rice, lingdi pickle, and fresh walnut chutney.",
        "why_less_touristy": "Located 32 km away from congested Old Manali, tucked in the heritage deodar village of Jana.",
        "best_time_to_visit": "10:30 AM – 03:30 PM for sunny valley weather and warm fresh lunches.",
        "how_to_reach": "Drive via Naggar on the left bank highway through apple orchards to Jana village.",
        "distance": "32 km from Manali town, 12 km from Naggar Castle",
        "travel_time": "1 hr 15 mins scenic drive",
        "entry_fee": 20,
        "parking": "Designated village gravel parking (₹50)",
        "activities": ["Tasting authentic woodfire Siddu", "Wooden bridge stream walks", "Apple orchard walks", "Mountain valley photography"],
        "nearby_attractions": ["Naggar Castle (12 km)", "Nicholas Roerich Art Gallery (14 km)"],
        "food_options": "The authentic Jana Dhaba serving traditional thali with makki roti, sarson saag, rajma, and hot siddu.",
        "safety_tips": "Winding narrow hill roads; drive carefully in winter months or rainy conditions.",
        "crowd_level": "Low to Moderate",
        "recommended_duration": "3 to 4 hours (including drive)",
        "approximate_cost": "₹250 – ₹400 per person for a lavish traditional lunch",
        "suitability_couples": "Very High (cozy mountain setting)",
        "suitability_families": "Very High (spacious streamside seating and delicious cultural food)",
        "tags": ["mountains", "waterfall", "food", "himachali", "culture"]
    },

    # ── KERALA ──
    {
        "id": "kerala-marari-beach",
        "name": "Marari Beach (Mararikulam)",
        "destination": "Kerala",
        "region": "Alleppey District",
        "category": "Quiet Coastal Village & Coconut Groves",
        "why_worth_visiting": "Endless quiet golden sand beach fringed by tall swaying coconut palms and traditional coir fishing hamlets, far removed from crowded tourist beaches.",
        "why_less_touristy": "Kept as a serene village beach without commercial jet skis, loud music, or high-rise resorts.",
        "best_time_to_visit": "06:30 AM – 09:30 AM (see local fishermen pulling shore nets) or 04:30 PM – 06:45 PM for sunset.",
        "how_to_reach": "14 km north of Alleppey town along the coastal road.",
        "distance": "14 km from Alleppey, 72 km from Kochi International Airport",
        "travel_time": "25 mins from Alleppey town",
        "entry_fee": 0,
        "parking": "Free public beach parking",
        "activities": ["Beach walks under palm canopies", "Watching traditional shore fishing", "Ayurvedic massage at nearby eco-retreats", "Sunset cycling"],
        "nearby_attractions": ["Alleppey Backwaters & Houseboat Jetting Point (14 km)", "Arthunkal St. Andrew's Basilica (7 km)"],
        "food_options": "Beachside thatched cafés serving fresh Karimeen Pollichathu (pearl spot fish in banana leaf) and tender coconut.",
        "safety_tips": "Sea currents can be strong; swim only in designated calm zones.",
        "crowd_level": "Low (tranquil, spacious)",
        "recommended_duration": "2 to 4 hours",
        "approximate_cost": "₹200 – ₹500",
        "suitability_couples": "Very High (romantic seclusion)",
        "suitability_families": "High (clean sand, open space)",
        "tags": ["beach", "kerala", "nature", "peaceful", "sunset"]
    },

    # ── DUBAI ──
    {
        "id": "dubai-al-fahidi-quarter",
        "name": "Al Fahidi Historical Neighborhood & Traditional Abra Trail",
        "destination": "Dubai",
        "region": "Bur Dubai / Dubai Creek",
        "category": "Old Arabia Heritage & Wind-Tower Architecture",
        "why_worth_visiting": "Preserved 1890s sandstone wind-tower (barjeel) courtyard houses, hidden art cafes, Arabian tea houses, and 1 AED traditional wooden Abra boat creek crossings.",
        "why_less_touristy": "Tourists flock to mega-malls and skyscrapers; Al Fahidi offers the serene, intimate soul of historic maritime Dubai.",
        "best_time_to_visit": "04:30 PM – 09:00 PM when courtyard lanterns are lit and cool evening breezes flow through the alleyways.",
        "how_to_reach": "Al Fahidi Metro Station (Green Line) or take the traditional 1 AED Abra boat from Deira Souq station.",
        "distance": "10 km from Downtown Dubai / Burj Khalifa",
        "travel_time": "15 mins via Metro or taxi",
        "entry_fee": 0,
        "parking": "Al Seef underground paid parking (AED 10/hr)",
        "activities": ["Strolling winding shaded sikkas (alleys)", "Visiting Coffee Museum & Coins Museum", "Taking a 1 AED Abra across Dubai Creek", "Traditional mint tea in courtyard cafes"],
        "nearby_attractions": ["Dubai Spice & Gold Souqs (cross via Abra)", "Al Seef Waterfront Promenade (300m)"],
        "food_options": "Arabian Tea House (iconic courtyard serving mint lemonade, saffron chai, and fresh flatbreads with hummus).",
        "safety_tips": "Dress modestly as a mark of respect in historic cultural areas.",
        "crowd_level": "Moderate (relaxed, photogenic pedestrian streets)",
        "recommended_duration": "2.5 to 4 hours",
        "approximate_cost": "AED 25 – AED 60 per person",
        "suitability_couples": "Very High (romantic candlelit courtyards)",
        "suitability_families": "Very High (completely car-free pedestrian paths)",
        "tags": ["heritage", "culture", "food", "history", "museum"]
    }
]


def search_hidden_places(destination: str, category: Optional[str] = None, max_results: int = 5) -> List[Dict[str, Any]]:
    """Search hidden gems by destination and optional category."""
    dest_lower = (destination or "").strip().lower()
    matches = []

    for place in HIDDEN_PLACES_DATA:
        if dest_lower in place["destination"].lower() or dest_lower in place.get("region", "").lower():
            if category:
                if category.lower() in place["category"].lower() or any(category.lower() in t for t in place["tags"]):
                    matches.append(place)
            else:
                matches.append(place)

    if not matches and dest_lower:
        # If no exact city match, fallback to general places
        matches = [p for p in HIDDEN_PLACES_DATA if p["destination"].lower() in dest_lower][:max_results]

    return matches[:max_results]


def get_all_hidden_places() -> List[Dict[str, Any]]:
    """Return all curated hidden places."""
    return HIDDEN_PLACES_DATA
