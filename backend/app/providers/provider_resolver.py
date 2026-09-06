import os
from typing import Dict, Any, List
from datetime import datetime, timezone

from app.providers.base_provider import (
    BaseProvider,
    FlightProvider,
    HotelProvider,
    ActivityProvider,
    TrainProvider,
    BusProvider,
    TransportProvider,
    WeatherProvider,
    CurrencyProvider,
    MapsProvider,
    PlacesProvider,
    ProviderStatus,
)
from app.providers.flight_provider import LiveFlightProvider, MockFlightProvider
from app.providers.hotel_provider import LiveHotelProvider, MockHotelProvider
from app.providers.activity_provider import LiveActivityProvider, MockActivityProvider
from app.providers.train_provider import MockTrainProvider
from app.providers.bus_provider import MockBusProvider
from app.providers.transport_provider import MockTransportProvider
from app.providers.weather_provider import LiveWeatherProvider, MockWeatherProvider, OpenWeatherMapProvider
from app.providers.currency_provider import LiveCurrencyProvider, MockCurrencyProvider
from app.providers.maps_provider import LiveMapsProvider, MockMapsProvider
from app.providers.places_provider import LivePlacesProvider, MockPlacesProvider


def resolve_flight_provider() -> FlightProvider:
    use_mock = os.environ.get("FLIGHTS_USE_MOCK", "true").lower() == "true"
    api_key = os.environ.get("FLIGHT_PROVIDER_API_KEY", "")
    if not use_mock and api_key:
        return LiveFlightProvider(api_key=api_key)
    return MockFlightProvider()


def resolve_hotel_provider() -> HotelProvider:
    use_mock = os.environ.get("HOTELS_USE_MOCK", "true").lower() == "true"
    api_key = os.environ.get("HOTEL_PROVIDER_API_KEY", "")
    if not use_mock and api_key:
        return LiveHotelProvider()
    return MockHotelProvider()


def resolve_activity_provider() -> ActivityProvider:
    use_mock = os.environ.get("ACTIVITIES_USE_MOCK", "true").lower() == "true"
    if not use_mock:
        return LiveActivityProvider()
    return MockActivityProvider()


def resolve_train_provider() -> TrainProvider:
    return MockTrainProvider()


def resolve_bus_provider() -> BusProvider:
    return MockBusProvider()


def resolve_transport_provider() -> TransportProvider:
    return MockTransportProvider()


def resolve_weather_provider() -> WeatherProvider:
    use_mock = os.environ.get("WEATHER_USE_MOCK", "false").lower() == "true"
    if use_mock:
        return MockWeatherProvider()

    api_key = (
        os.environ.get("OPENWEATHER_API_KEY")
        or os.environ.get("WEATHER_API_KEY")
        or os.environ.get("OPENWEATHERMAP_API_KEY")
        or ""
    ).strip()

    if api_key:
        return OpenWeatherMapProvider(api_key=api_key)

    return LiveWeatherProvider()


def resolve_currency_provider() -> CurrencyProvider:
    use_mock = os.environ.get("CURRENCY_USE_MOCK", "false").lower() == "true"
    if use_mock:
        return MockCurrencyProvider()
    return LiveCurrencyProvider()


def resolve_maps_provider() -> MapsProvider:
    use_mock = os.environ.get("MAPS_USE_MOCK", "false").lower() == "true"
    if use_mock:
        return MockMapsProvider()
    return LiveMapsProvider()


def resolve_places_provider() -> PlacesProvider:
    use_mock = os.environ.get("PLACES_USE_MOCK", "false").lower() == "true"
    if use_mock:
        return MockPlacesProvider()
    return LivePlacesProvider()


def get_all_provider_statuses() -> List[Dict[str, Any]]:
    """Get metadata and current status for all 10 provider categories."""
    providers: List[BaseProvider] = [
        resolve_flight_provider(),
        resolve_hotel_provider(),
        resolve_activity_provider(),
        resolve_train_provider(),
        resolve_bus_provider(),
        resolve_transport_provider(),
        resolve_weather_provider(),
        resolve_currency_provider(),
        resolve_maps_provider(),
        resolve_places_provider(),
    ]
    return [p.get_status() for p in providers]


def check_all_providers_health() -> List[Dict[str, Any]]:
    """Execute live health ping against all 10 provider categories."""
    resolvers = [
        ("Flights", resolve_flight_provider),
        ("Hotels", resolve_hotel_provider),
        ("Activities", resolve_activity_provider),
        ("Trains", resolve_train_provider),
        ("Buses", resolve_bus_provider),
        ("Transport & Cabs", resolve_transport_provider),
        ("Weather", resolve_weather_provider),
        ("Currency FX", resolve_currency_provider),
        ("Maps & Routing", resolve_maps_provider),
        ("Nearby Places", resolve_places_provider),
    ]

    results = []
    for cat_name, resolver_fn in resolvers:
        provider = resolver_fn()
        meta = provider.get_status()
        try:
            is_healthy, msg, latency_ms = provider.health_check()
            status = "operational" if is_healthy else "degraded"
            if meta.get("data_type") == "DEMO" and is_healthy:
                status = "sandbox"
        except Exception as e:
            status = "down"
            latency_ms = 999
            msg = f"Check failed: {str(e)}"

        results.append({
            "name": meta.get("name", cat_name),
            "category": cat_name,
            "status": status,
            "data_type": meta.get("data_type", "DEMO"),
            "latency_ms": latency_ms,
            "message": msg,
            "last_checked": datetime.now(timezone.utc).isoformat(),
        })

    return results
