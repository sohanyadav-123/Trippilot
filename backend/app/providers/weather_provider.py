import time
import random
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from app.providers.base_provider import WeatherProvider, ProviderStatus, provider_cache, http_get_json

CITY_COORDINATES: Dict[str, Tuple[float, float]] = {
    "delhi": (28.6139, 77.2090),
    "new delhi": (28.6139, 77.2090),
    "goa": (15.2993, 74.1240),
    "mumbai": (19.0760, 72.8777),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "hyderabad": (17.3850, 78.4867),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "jaipur": (26.9124, 75.7873),
    "udaipur": (24.5854, 73.7125),
    "manali": (32.2432, 77.1892),
    "shimla": (31.1048, 77.1734),
    "kerala": (10.8505, 76.2711),
    "kochi": (9.9312, 76.2673),
    "munnar": (10.0889, 77.0595),
    "dubai": (25.2048, 55.2708),
    "singapore": (1.3521, 103.8198),
    "bangkok": (13.7563, 100.5018),
    "bali": (-8.4095, 115.1889),
    "paris": (48.8566, 2.3522),
    "london": (51.5074, -0.1278),
    "tokyo": (35.6762, 139.6503),
    "maldives": (3.2028, 73.2207),
    "phuket": (7.8804, 98.3923),
}

WMO_WEATHER_CODES = {
    0: ("Clear Sky", "Sunny", "optimal"),
    1: ("Mainly Clear", "Mostly Sunny", "optimal"),
    2: ("Partly Cloudy", "Partly Cloudy", "optimal"),
    3: ("Overcast", "Cloudy", "optimal"),
    45: ("Fog", "Foggy", "moderate"),
    48: ("Depositing Rime Fog", "Foggy", "moderate"),
    51: ("Light Drizzle", "Drizzle", "moderate"),
    53: ("Moderate Drizzle", "Drizzle", "moderate"),
    55: ("Dense Drizzle", "Rainy", "indoor_safe"),
    61: ("Slight Rain", "Light Rain", "moderate"),
    63: ("Moderate Rain", "Rainy", "indoor_safe"),
    65: ("Heavy Rain", "Heavy Rain", "indoor_safe"),
    71: ("Slight Snow", "Light Snow", "moderate"),
    73: ("Moderate Snow", "Snowy", "indoor_safe"),
    75: ("Heavy Snow", "Heavy Snow", "indoor_safe"),
    80: ("Slight Rain Showers", "Rain Showers", "moderate"),
    81: ("Moderate Rain Showers", "Rain Showers", "indoor_safe"),
    82: ("Violent Rain Showers", "Thunderstorms", "indoor_safe"),
    95: ("Thunderstorm", "Thunderstorm", "indoor_safe"),
    96: ("Thunderstorm with Slight Hail", "Storm", "indoor_safe"),
    99: ("Thunderstorm with Heavy Hail", "Severe Storm", "indoor_safe"),
}


class LiveWeatherProvider(WeatherProvider):
    """
    Real-time Live Weather Provider powered by Open-Meteo Global Meteorological API.
    Zero API key required; verified real meteorological forecasts.
    """
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "Open-Meteo Global Meteorological Network",
            "category": "Weather",
            "status": ProviderStatus.CONNECTED,
            "data_type": "LIVE",
            "is_live": True,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Real-time atmospheric models, hourly & 7-day temperature, UV, and rain probability forecasts.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        test_url = f"{self.BASE_URL}?latitude=28.6139&longitude=77.2090&current=temperature_2m"
        success, data, latency = http_get_json(test_url, timeout=4)
        if success and isinstance(data, dict) and "current" in data:
            return True, "Open-Meteo Weather API reachable and operational", latency
        return False, f"Weather API error: {data}", latency

    def get_weather(self, city: str, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        city_clean = city.strip().lower()
        if lat is None or lon is None:
            coords = CITY_COORDINATES.get(city_clean, (15.2993, 74.1240))  # Default to Goa if unknown
            lat, lon = coords

        cache_key = f"weather_live_{lat:.4f}_{lon:.4f}"
        cached = provider_cache.get(cache_key)
        if cached:
            return cached

        url = (
            f"{self.BASE_URL}?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m"
            f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max"
            f"&timezone=auto"
        )

        success, data, latency = http_get_json(url, timeout=5)

        if not success or not isinstance(data, dict) or "current" not in data:
            # Fallback to Mock Weather Provider on network timeout
            mock = MockWeatherProvider()
            return mock.get_weather(city, lat, lon)

        current = data.get("current", {})
        daily = data.get("daily", {})

        w_code = current.get("weather_code", 0)
        desc, summary, suitability = WMO_WEATHER_CODES.get(w_code, ("Clear", "Sunny", "optimal"))

        temp = round(current.get("temperature_2m", 28.0), 1)
        feels_like = round(current.get("apparent_temperature", temp + 2), 1)
        humidity = current.get("relative_humidity_2m", 65)
        wind_speed = round(current.get("wind_speed_10m", 12.0), 1)
        precip = current.get("precipitation", 0.0)

        daily_time = daily.get("time", [])
        daily_max = daily.get("temperature_2m_max", [])
        daily_min = daily.get("temperature_2m_min", [])
        daily_rain = daily.get("precipitation_probability_max", [])
        daily_uv = daily.get("uv_index_max", [])
        daily_code = daily.get("weather_code", [])

        forecast_days = []
        for i in range(min(5, len(daily_time))):
            d_code = daily_code[i] if i < len(daily_code) else 0
            d_desc, _, _ = WMO_WEATHER_CODES.get(d_code, ("Sunny", "Sunny", "optimal"))
            forecast_days.append({
                "date": daily_time[i],
                "day_name": datetime.fromisoformat(daily_time[i]).strftime("%a") if "-" in daily_time[i] else f"Day {i+1}",
                "max_temp": round(daily_max[i], 1) if i < len(daily_max) else temp + 2,
                "min_temp": round(daily_min[i], 1) if i < len(daily_min) else temp - 4,
                "rain_probability": daily_rain[i] if i < len(daily_rain) else 10,
                "uv_index": daily_uv[i] if i < len(daily_uv) else 6.0,
                "condition": d_desc,
            })

        max_rain_prob = max(daily_rain) if daily_rain else 15
        uv_index = daily_uv[0] if daily_uv else 6.5

        # Check for weather alerts
        alerts = []
        if max_rain_prob >= 75 or w_code in [65, 82, 95, 96, 99]:
            alerts.append({
                "severity": "warning",
                "title": "High Rain / Storm Advisory",
                "message": f"Rain probability reaches {max_rain_prob}% with potential showers. Plan indoor visits or carry umbrellas.",
                "affected_category": "outdoor_activities",
            })
        elif uv_index >= 8.5:
            alerts.append({
                "severity": "info",
                "title": "High UV Index",
                "message": f"Peak UV index {uv_index}. Sun protection and sunscreen recommended between 11 AM - 3 PM.",
                "affected_category": "sightseeing",
            })

        result = {
            "provider": "Open-Meteo Live Forecast",
            "source": "OPEN_METEO_API",
            "data_type": "LIVE",
            "is_live": True,
            "city": city.title(),
            "coordinates": {"lat": lat, "lon": lon},
            "temperature": temp,
            "feels_like": feels_like,
            "humidity": humidity,
            "condition": desc,
            "summary": summary,
            "suitability": suitability,
            "wind_speed_kmh": wind_speed,
            "rain_probability": max_rain_prob,
            "uv_index": uv_index,
            "precipitation_mm": precip,
            "alerts": alerts,
            "forecast": forecast_days,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

        # Cache for 15 minutes
        provider_cache.set(cache_key, result, ttl_seconds=900)
        return result


class MockWeatherProvider(WeatherProvider):
    """Fallback seasonal simulated weather provider."""
    def get_status(self) -> Dict[str, Any]:
        return {
            "name": "TripPilot Demo Weather Simulator",
            "category": "Weather",
            "status": ProviderStatus.DEMO,
            "data_type": "DEMO",
            "is_live": False,
            "last_checked": datetime.now(timezone.utc).isoformat(),
            "description": "Heuristic seasonal weather simulation for offline development.",
        }

    def health_check(self) -> Tuple[bool, str, int]:
        return True, "Mock weather engine ready", 2

    def get_weather(self, city: str, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        city_title = city.strip().title() or "Goa"
        seed_num = sum(ord(c) for c in city_title)
        rng = random.Random(seed_num)

        temp = rng.randint(24, 32)
        feels = temp + rng.randint(1, 3)
        rain_prob = rng.randint(10, 45)
        uv = round(rng.uniform(5.5, 8.5), 1)

        forecast = []
        days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        for d in days:
            forecast.append({
                "date": datetime.now().strftime("%Y-%m-%d"),
                "day_name": d,
                "max_temp": temp + rng.randint(1, 3),
                "min_temp": temp - rng.randint(3, 6),
                "rain_probability": rng.randint(10, 40),
                "uv_index": uv,
                "condition": "Partly Cloudy" if rain_prob < 30 else "Light Showers",
            })

        return {
            "provider": "TripPilot Demo Weather Simulator",
            "source": "SIMULATED_DATA",
            "data_type": "DEMO",
            "is_live": False,
            "city": city_title,
            "coordinates": {"lat": lat or 15.2993, "lon": lon or 74.1240},
            "temperature": temp,
            "feels_like": feels,
            "humidity": 68,
            "condition": "Pleasant & Clear" if rain_prob < 30 else "Light Showers",
            "summary": "Clear Skies",
            "suitability": "optimal",
            "wind_speed_kmh": 14.0,
            "rain_probability": rain_prob,
            "uv_index": uv,
            "precipitation_mm": 0.0,
            "alerts": [],
            "forecast": forecast,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
