import math
import urllib.parse
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from app.providers.base_provider import MapsProvider, ProviderStatus, provider_cache, http_get_json

CITY_COORDS = {
    "delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),
    "goa": (15.2993, 74.1240),
    "panaji": (15.4909, 73.8278),
    "baga": (15.5553, 73.7517),
    "calangute": (15.5439, 73.7554),
    "candolim": (15.5173, 73.7663),
    "anjuna": (15.5841, 73.7439),
    "benaulim": (15.2536, 73.9238),
    "bengaluru": (12.9716, 77.5946),
    "hyderabad": (17.3850, 78.4867),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "jaipur": (26.9124, 75.7873),
    "udaipur": (24.5854, 73.7125),
    "manali": (32.2432, 77.1892),
    "dubai": (25.2048, 55.2708),
    "singapore": (1.3521, 103.8198),
    "paris": (48.8566, 2.3522),
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


class LiveMapsProvider(MapsProvider):
    """
    Live Maps & Routing Provider using OpenStreetMap Nominatim Geocoding and OSRM Open Routing Engine.
    """
    OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "OSRM & OpenStreetMap Routing Network",
            "category": "Maps & Routing",
            "status": ProviderStatus.CONNECTED,
            "data_type": "LIVE",
            "is_live": True,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Real road-network routing, geocoding, turn-by-turn travel times, and waypoint distances.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        # Test routing between Delhi and Gurgaon
        test_url = f"{self.OSRM_URL}/77.2090,28.6139;77.0266,28.4595?overview=false"
        success, data, latency = http_get_json(test_url, timeout=4)
        if success and isinstance(data, dict) and data.get("code") == "Ok":
            return True, "OSRM Routing Engine reachable and verified", latency
        return False, f"OSRM error: {data}", latency

    def geocode(self, query: str) -> Optional[Dict[str, Any]]:
        q_clean = query.strip().lower()
        if q_clean in CITY_COORDS:
            lat, lon = CITY_COORDS[q_clean]
            return {"query": query, "lat": lat, "lon": lon, "display_name": query.title(), "source": "LOCAL_GEO_INDEX"}

        cache_key = f"geocode_{q_clean}"
        cached = provider_cache.get(cache_key)
        if cached:
            return cached

        encoded = urllib.parse.quote(query)
        url = f"{self.NOMINATIM_URL}?q={encoded}&format=json&limit=1"
        success, data, latency = http_get_json(url, timeout=4)

        if success and isinstance(data, list) and len(data) > 0:
            item = data[0]
            result = {
                "query": query,
                "lat": float(item["lat"]),
                "lon": float(item["lon"]),
                "display_name": item.get("display_name", query),
                "source": "OPENSTREETMAP_NOMINATIM",
            }
            provider_cache.set(cache_key, result, ttl_seconds=86400)
            return result

        # Fallback default
        return {"query": query, "lat": 15.2993, "lon": 74.1240, "display_name": query, "source": "FALLBACK"}

    def get_distance_and_time(self, origin: str, destination: str,
                              origin_coords: Optional[Tuple[float, float]] = None,
                              dest_coords: Optional[Tuple[float, float]] = None) -> Dict[str, Any]:
        if origin_coords is None:
            geo_orig = self.geocode(origin)
            origin_coords = (geo_orig["lat"], geo_orig["lon"]) if geo_orig else (15.2993, 74.1240)

        if dest_coords is None:
            geo_dest = self.geocode(destination)
            dest_coords = (geo_dest["lat"], geo_dest["lon"]) if geo_dest else (15.4909, 73.8278)

        lat1, lon1 = origin_coords
        lat2, lon2 = dest_coords

        cache_key = f"route_{lat1:.4f}_{lon1:.4f}_to_{lat2:.4f}_{lon2:.4f}"
        cached = provider_cache.get(cache_key)
        if cached:
            return cached

        # Call OSRM routing engine
        url = f"{self.OSRM_URL}/{lon1},{lat1};{lon2},{lat2}?overview=false"
        success, data, latency = http_get_json(url, timeout=5)

        if success and isinstance(data, dict) and data.get("code") == "Ok":
            routes = data.get("routes", [])
            if routes:
                route = routes[0]
                distance_km = round(route.get("distance", 0) / 1000.0, 1)
                duration_min = round(route.get("duration", 0) / 60.0)

                # Format human readable duration
                if duration_min < 60:
                    dur_text = f"{duration_min} min"
                else:
                    hours = duration_min // 60
                    mins = duration_min % 60
                    dur_text = f"{hours}h {mins}m" if mins > 0 else f"{hours} hours"

                result = {
                    "origin": origin.title(),
                    "destination": destination.title(),
                    "origin_coords": {"lat": lat1, "lon": lon1},
                    "destination_coords": {"lat": lat2, "lon": lon2},
                    "distance_km": distance_km,
                    "duration_minutes": duration_min,
                    "formatted_duration": dur_text,
                    "provider": "OSRM Real Road Network",
                    "data_type": "LIVE",
                    "is_live": True,
                    "source": "OPEN_SOURCE_ROUTING_MACHINE",
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                }
                provider_cache.set(cache_key, result, ttl_seconds=86400)
                return result

        # Fallback to MockMapsProvider if OSRM is unreachable
        mock = MockMapsProvider()
        return mock.get_distance_and_time(origin, destination, origin_coords, dest_coords)


class MockMapsProvider(MapsProvider):
    """Fallback heuristic travel distance and driving time calculator."""
    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "TripPilot Demo Distance Estimator",
            "category": "Maps & Routing",
            "status": ProviderStatus.DEMO,
            "data_type": "ESTIMATED",
            "is_live": False,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Geographical Haversine distance with traffic congestion adjustment heuristics.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        return True, "Mock distance engine operational", 1

    def geocode(self, query: str) -> Optional[Dict[str, Any]]:
        q_clean = query.strip().lower()
        coords = CITY_COORDS.get(q_clean, (15.2993, 74.1240))
        return {"query": query, "lat": coords[0], "lon": coords[1], "display_name": query.title(), "source": "ESTIMATED_INDEX"}

    def get_distance_and_time(self, origin: str, destination: str,
                              origin_coords: Optional[Tuple[float, float]] = None,
                              dest_coords: Optional[Tuple[float, float]] = None) -> Dict[str, Any]:
        if origin_coords is None:
            geo_orig = self.geocode(origin)
            origin_coords = (geo_orig["lat"], geo_orig["lon"]) if geo_orig else (15.2993, 74.1240)

        if dest_coords is None:
            geo_dest = self.geocode(destination)
            dest_coords = (geo_dest["lat"], geo_dest["lon"]) if geo_dest else (15.4909, 73.8278)

        lat1, lon1 = origin_coords
        lat2, lon2 = dest_coords

        raw_km = haversine_km(lat1, lon1, lat2, lon2)
        # Apply 1.28 road winding factor
        road_km = max(1.2, round(raw_km * 1.28, 1))

        # Speed heuristic: 32 km/h for short city trips, 55 km/h for intercity
        speed = 32.0 if road_km < 40 else 55.0
        duration_min = max(5, round((road_km / speed) * 60))

        if duration_min < 60:
            dur_text = f"{duration_min} min"
        else:
            hours = duration_min // 60
            mins = duration_min % 60
            dur_text = f"{hours}h {mins}m" if mins > 0 else f"{hours} hours"

        return {
            "origin": origin.title(),
            "destination": destination.title(),
            "origin_coords": {"lat": lat1, "lon": lon1},
            "destination_coords": {"lat": lat2, "lon": lon2},
            "distance_km": road_km,
            "duration_minutes": duration_min,
            "formatted_duration": dur_text,
            "provider": "TripPilot Estimated Travel Engine",
            "data_type": "ESTIMATED",
            "is_live": False,
            "source": "HAVERSINE_TRAFFIC_HEURISTIC",
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
