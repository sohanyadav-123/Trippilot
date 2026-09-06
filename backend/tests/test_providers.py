import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app
from app.providers.provider_resolver import (
    resolve_flight_provider,
    resolve_hotel_provider,
    resolve_activity_provider,
    resolve_train_provider,
    resolve_bus_provider,
    resolve_transport_provider,
    resolve_weather_provider,
    resolve_currency_provider,
    resolve_maps_provider,
    resolve_places_provider,
    get_all_provider_statuses,
    check_all_providers_health,
)


@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    return app.test_client()


def test_provider_statuses():
    statuses = get_all_provider_statuses()
    assert len(statuses) == 10
    categories = [s["category"] for s in statuses]
    assert "Weather" in categories
    assert "Currency" in categories
    assert "Maps & Routing" in categories
    assert "Flights" in categories
    assert "Hotels & Stays" in categories


def test_provider_health_checks():
    health_results = check_all_providers_health()
    assert len(health_results) == 10
    for res in health_results:
        assert "status" in res
        assert "latency_ms" in res
        assert res["status"] in ["operational", "sandbox", "degraded", "down"]


def test_weather_provider():
    weather_prov = resolve_weather_provider()
    data = weather_prov.get_weather("Goa", 15.2993, 74.1240)
    assert "temperature" in data
    assert "rain_probability" in data
    assert "uv_index" in data
    assert "forecast" in data
    assert len(data["forecast"]) >= 3
    assert data["data_type"] in ["LIVE", "DEMO"]


def test_currency_provider_convert():
    curr_prov = resolve_currency_provider()
    rates = curr_prov.get_rates("INR")
    assert "rates" in rates
    assert len(rates["rates"]) >= 5

    res = curr_prov.convert(1000, "INR", "USD")
    assert res["amount"] == 1000
    assert res["from_currency"] == "INR"
    assert res["to_currency"] == "USD"
    assert res["converted_amount"] > 0
    assert res["exchange_rate"] > 0


def test_maps_provider():
    maps_prov = resolve_maps_provider()
    geo = maps_prov.geocode("Goa")
    assert geo is not None
    assert "lat" in geo and "lon" in geo

    dist = maps_prov.get_distance_and_time("Panaji", "Anjuna")
    assert "distance_km" in dist
    assert "duration_minutes" in dist
    assert dist["distance_km"] > 0
    assert dist["duration_minutes"] > 0


def test_places_provider():
    places_prov = resolve_places_provider()
    res = places_prov.get_nearby_places("Goa", "restaurant")
    assert "places" in res
    assert len(res["places"]) > 0
    first = res["places"][0]
    assert "name" in first
    assert "cuisine" in first
    assert "distance_km" in first


def test_flight_provider():
    fl_prov = resolve_flight_provider()
    res = fl_prov.search_flights("Delhi", "Goa", "2026-09-15")
    assert "flights" in res
    assert len(res["flights"]) > 0
    flight = res["flights"][0]
    assert "flight_number" in flight
    assert "airline" in flight
    assert "price" in flight
    assert "duration" in flight


def test_hotel_provider():
    ht_prov = resolve_hotel_provider()
    res = ht_prov.search_hotels("Goa", "2026-09-15", "2026-09-18")
    assert "hotels" in res
    assert len(res["hotels"]) > 0
    hotel = res["hotels"][0]
    assert "name" in hotel
    assert "price_per_night" in hotel
    assert "rating" in hotel


def test_train_and_bus_providers():
    train_prov = resolve_train_provider()
    train_res = train_prov.search_trains("Mumbai", "Goa", "2026-09-15")
    assert "trains" in train_res
    assert len(train_res["trains"]) > 0

    bus_prov = resolve_bus_provider()
    bus_res = bus_prov.search_buses("Mumbai", "Goa", "2026-09-15")
    assert "buses" in bus_res
    assert len(bus_res["buses"]) > 0


def test_provider_api_endpoints(client):
    status_resp = client.get("/api/providers/status")
    assert status_resp.status_code == 200
    assert "providers" in status_resp.get_json()["data"]

    weather_resp = client.get("/api/providers/weather?city=Goa")
    assert weather_resp.status_code == 200
    assert "temperature" in weather_resp.get_json()["data"]

    curr_resp = client.get("/api/providers/currency/rates")
    assert curr_resp.status_code == 200
    assert "rates" in curr_resp.get_json()["data"]

    convert_resp = client.get("/api/providers/currency/convert?amount=5000&from=INR&to=USD")
    assert convert_resp.status_code == 200
    assert convert_resp.get_json()["data"]["converted_amount"] > 0

    dist_resp = client.get("/api/providers/maps/distance?origin=Panaji&destination=Baga")
    assert dist_resp.status_code == 200
    assert dist_resp.get_json()["data"]["distance_km"] > 0

    places_resp = client.get("/api/providers/places/nearby?location=Goa")
    assert places_resp.status_code == 200
    assert len(places_resp.get_json()["data"]["places"]) > 0
