from flask import Blueprint, request
from app.utils.helpers import success_response, error_response
from app.providers.provider_resolver import (
    get_all_provider_statuses,
    resolve_weather_provider,
    resolve_currency_provider,
    resolve_maps_provider,
    resolve_places_provider,
    resolve_train_provider,
    resolve_bus_provider,
    resolve_transport_provider,
)

providers_bp = Blueprint("providers", __name__)


@providers_bp.route("/status", methods=["GET"])
def get_status():
    """Public summary of external data providers, categories, and data types."""
    statuses = get_all_provider_statuses()
    return success_response(data={"providers": statuses})


@providers_bp.route("/weather", methods=["GET"])
def get_weather():
    """Fetch live or simulated weather forecast for a destination."""
    city = request.args.get("city", "Goa")
    lat_str = request.args.get("lat")
    lon_str = request.args.get("lon")
    lat = float(lat_str) if lat_str else None
    lon = float(lon_str) if lon_str else None

    provider = resolve_weather_provider()
    weather_data = provider.get_weather(city, lat, lon)
    return success_response(data=weather_data)


@providers_bp.route("/currency/rates", methods=["GET"])
def get_currency_rates():
    """Fetch benchmark or live foreign exchange rates."""
    base = request.args.get("base", "INR")
    provider = resolve_currency_provider()
    rates_data = provider.get_rates(base)
    return success_response(data=rates_data)


@providers_bp.route("/currency/convert", methods=["GET"])
def convert_currency():
    """Convert amount between two currencies."""
    try:
        amount = float(request.args.get("amount", 100))
    except (ValueError, TypeError):
        return error_response("Invalid amount parameter", 400)

    from_c = request.args.get("from", "INR")
    to_c = request.args.get("to", "USD")

    provider = resolve_currency_provider()
    result = provider.convert(amount, from_c, to_c)
    return success_response(data=result)


@providers_bp.route("/maps/distance", methods=["GET"])
def get_distance():
    """Calculate real road distance (km) and driving time (min) between two locations."""
    origin = request.args.get("origin", "Panaji")
    destination = request.args.get("destination", "Baga Beach")

    provider = resolve_maps_provider()
    result = provider.get_distance_and_time(origin, destination)
    return success_response(data=result)


@providers_bp.route("/maps/geocode", methods=["GET"])
def geocode():
    """Geocode a place query into coordinates."""
    query = request.args.get("query", "Goa")
    provider = resolve_maps_provider()
    result = provider.geocode(query)
    if result:
        return success_response(data=result)
    return error_response("Location not found", 404)


@providers_bp.route("/places/nearby", methods=["GET"])
def get_nearby_places():
    """Search nearby verified restaurants, cafes, attractions, pharmacies, and ATMs."""
    location = request.args.get("location", "Goa")
    category = request.args.get("category", "all")
    radius_km = float(request.args.get("radius", 5.0))

    provider = resolve_places_provider()
    result = provider.get_nearby_places(location, category, radius_km)
    return success_response(data=result)


@providers_bp.route("/trains/search", methods=["GET"])
def search_trains():
    """Search railway schedules and seat availability."""
    origin = request.args.get("origin", "Mumbai")
    destination = request.args.get("destination", "Goa")
    date = request.args.get("date", "2026-09-15")

    provider = resolve_train_provider()
    result = provider.search_trains(origin, destination, date)
    return success_response(data=result)


@providers_bp.route("/buses/search", methods=["GET"])
def search_buses():
    """Search intercity luxury buses and seat availability."""
    origin = request.args.get("origin", "Mumbai")
    destination = request.args.get("destination", "Goa")
    date = request.args.get("date", "2026-09-15")

    provider = resolve_bus_provider()
    result = provider.search_buses(origin, destination, date)
    return success_response(data=result)


@providers_bp.route("/transport/search", methods=["GET"])
def search_transport():
    """Search airport transfers, rental cars, and chauffeur cabs."""
    origin = request.args.get("origin", "Goa Airport (GOI)")
    destination = request.args.get("destination", "Hotel Resort")
    date = request.args.get("date", "2026-09-15")
    transport_type = request.args.get("type", "all")

    provider = resolve_transport_provider()
    result = provider.search_transport(origin, destination, date, transport_type)
    return success_response(data=result)
