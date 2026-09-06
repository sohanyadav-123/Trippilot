import time
import json
import urllib.request
import urllib.parse
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class ProviderStatus:
    CONNECTED = "CONNECTED"
    DEMO = "DEMO"
    NOT_CONFIGURED = "NOT_CONFIGURED"
    ERROR = "ERROR"
    DISABLED = "DISABLED"


class SimpleMemoryCache:
    """In-memory cache with time-to-live (TTL) in seconds."""
    def __init__(self):
        self._cache: Dict[str, Tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            expires_at, value = self._cache[key]
            if time.time() < expires_at:
                return value
            else:
                del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        self._cache[key] = (time.time() + ttl_seconds, value)

    def clear(self) -> None:
        self._cache.clear()


# Shared cache instance
provider_cache = SimpleMemoryCache()


def http_get_json(url: str, headers: Optional[Dict[str, str]] = None, timeout: int = 5) -> Tuple[bool, Any, int]:
    """
    Perform a safe HTTP GET request and parse JSON.
    Returns: (success, parsed_json_or_error_str, status_code)
    """
    req_headers = {
        "User-Agent": "TripPilot-Platform/1.0",
        "Accept": "application/json",
    }
    if headers:
        req_headers.update(headers)

    req = urllib.request.Request(url, headers=req_headers)
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            status_code = response.status
            content = response.read().decode("utf-8")
            data = json.loads(content)
            latency_ms = int((time.time() - start_time) * 1000)
            return True, data, latency_ms
    except urllib.error.HTTPError as e:
        latency_ms = int((time.time() - start_time) * 1000)
        logger.warning(f"HTTP error fetching {url}: {e.code} {e.reason}")
        return False, f"HTTP {e.code}: {e.reason}", latency_ms
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        logger.warning(f"Error fetching {url}: {str(e)}")
        return False, str(e), latency_ms


# ==========================================
# Base Provider Interfaces
# ==========================================

class BaseProvider(ABC):
    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Return provider status metadata and health."""
        pass

    @abstractmethod
    def health_check(self) -> Tuple[bool, str, int]:
        """
        Run test ping/request against provider.
        Returns: (is_healthy, message, latency_ms)
        """
        pass


class FlightProvider(BaseProvider):
    @abstractmethod
    def search_flights(self, origin: str, destination: str, departure_date: str,
                       return_date: Optional[str] = None, passengers: int = 1,
                       cabin_class: str = "economy", sort_by: str = "recommended",
                       filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pass


class HotelProvider(BaseProvider):
    @abstractmethod
    def search_hotels(self, city: str, check_in: str, check_out: str,
                      guests: int = 1, rooms: int = 1,
                      min_price: Optional[float] = None, max_price: Optional[float] = None,
                      min_rating: Optional[float] = None, amenities: Optional[List[str]] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_hotel_details(self, hotel_id: str) -> Optional[Dict[str, Any]]:
        pass


class ActivityProvider(BaseProvider):
    @abstractmethod
    def search_activities(self, destination: str, category: Optional[str] = None,
                          max_price: Optional[float] = None) -> Dict[str, Any]:
        pass


class TrainProvider(BaseProvider):
    @abstractmethod
    def search_trains(self, origin: str, destination: str, date: str) -> Dict[str, Any]:
        pass


class BusProvider(BaseProvider):
    @abstractmethod
    def search_buses(self, origin: str, destination: str, date: str) -> Dict[str, Any]:
        pass


class TransportProvider(BaseProvider):
    @abstractmethod
    def search_transport(self, origin: str, destination: str, date: str, transport_type: str = "all") -> Dict[str, Any]:
        pass


class WeatherProvider(BaseProvider):
    @abstractmethod
    def get_weather(self, city: str, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        pass


class CurrencyProvider(BaseProvider):
    @abstractmethod
    def get_rates(self, base_currency: str = "INR") -> Dict[str, Any]:
        pass

    @abstractmethod
    def convert(self, amount: float, from_curr: str, to_curr: str) -> Dict[str, Any]:
        pass


class MapsProvider(BaseProvider):
    @abstractmethod
    def get_distance_and_time(self, origin: str, destination: str,
                              origin_coords: Optional[Tuple[float, float]] = None,
                              dest_coords: Optional[Tuple[float, float]] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def geocode(self, query: str) -> Optional[Dict[str, Any]]:
        pass


class PlacesProvider(BaseProvider):
    @abstractmethod
    def get_nearby_places(self, location: str, category: str = "restaurant",
                          radius_km: float = 5.0,
                          lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        pass
