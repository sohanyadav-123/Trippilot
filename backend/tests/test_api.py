import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from unittest.mock import patch, MagicMock
from app import create_app


@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    return app.test_client()


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"


def test_register_missing_fields(client):
    with patch("app.services.auth_service.get_db") as mock_db:
        mock_db.return_value.users.find_one.return_value = None
        response = client.post("/api/auth/register", json={})
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False


def test_register_invalid_email(client):
    with patch("app.services.auth_service.get_db") as mock_db:
        mock_db.return_value.users.find_one.return_value = None
        response = client.post("/api/auth/register", json={
            "name": "Test User", "email": "not-an-email", "password": "Password1"
        })
        assert response.status_code == 400


def test_register_weak_password(client):
    with patch("app.services.auth_service.get_db") as mock_db:
        mock_db.return_value.users.find_one.return_value = None
        response = client.post("/api/auth/register", json={
            "name": "Test User", "email": "test@example.com", "password": "weak"
        })
        assert response.status_code == 400


def test_login_invalid_credentials(client):
    with patch("app.services.auth_service.get_db") as mock_db:
        mock_db.return_value.users.find_one.return_value = None
        response = client.post("/api/auth/login", json={
            "email": "noone@example.com", "password": "Password1"
        })
        assert response.status_code == 401
        data = response.get_json()
        assert data["success"] is False


def test_protected_route_no_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_search_flights(client):
    with patch("app.services.search_service.get_db") as mock_db:
        mock_cursor = MagicMock()
        mock_cursor.sort.return_value.skip.return_value.limit.return_value = []
        mock_db.return_value.flights.find.return_value = mock_cursor
        mock_db.return_value.flights.count_documents.return_value = 0
        response = client.get("/api/search/flights?origin=Delhi&destination=Goa")
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert "flights" in data["data"]


def test_search_hotels(client):
    with patch("app.services.search_service.get_db") as mock_db:
        mock_cursor = MagicMock()
        mock_cursor.sort.return_value.skip.return_value.limit.return_value = []
        mock_db.return_value.hotels.find.return_value = mock_cursor
        mock_db.return_value.hotels.count_documents.return_value = 0
        response = client.get("/api/search/hotels?city=Goa")
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert "hotels" in data["data"]


def test_ai_recommendations_fallback(client):
    with patch("app.routes.ai.get_db") as mock_db:
        mock_db.return_value.destinations.find.return_value.limit.return_value = []
        response = client.post("/api/ai/recommendations", json={
            "origin": "Delhi", "destination": "Beach", "budget": 30000
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True


def test_payment_create_missing_amount(client):
    response = client.post("/api/payments/create", json={})
    assert response.status_code == 401


def test_budget_calculation():
    from app.services.booking_service import calculate_booking_total
    with patch("app.services.booking_service.get_db") as mock_db:
        result = calculate_booking_total([], 1)
        assert result["subtotal"] == 0
        assert result["total"] == 0


def test_currency_rates(client):
    response = client.get("/api/budgets/currency/rates")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "rates" in data["data"]
    assert len(data["data"]["rates"]) == 8


# --- PHASE 8 TESTS ---

def test_forgot_password_endpoint(client):
    with patch("app.services.auth_service.get_db") as mock_db:
        mock_db.return_value.users.find_one.return_value = {"_id": "u1", "email": "test@example.com"}
        mock_db.return_value.users.update_one.return_value = MagicMock()
        response = client.post("/api/auth/forgot-password", json={"email": "test@example.com"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True


def test_reset_password_invalid_token(client):
    with patch("app.services.auth_service.get_db") as mock_db:
        mock_db.return_value.users.find_one.return_value = None
        response = client.post("/api/auth/reset-password", json={
            "token": "invalid-or-expired-token",
            "new_password": "NewValidPassword@123"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False


def test_admin_stats_unauthorized(client):
    response = client.get("/api/admin/stats")
    assert response.status_code == 401


def test_admin_providers_unauthorized(client):
    response = client.get("/api/admin/providers")
    assert response.status_code == 401


def test_admin_system_health_unauthorized(client):
    response = client.get("/api/admin/system-health")
    assert response.status_code == 401


def test_booking_calculate_endpoint(client):
    response = client.post("/api/bookings/calculate", json={
        "selected_items": [],
        "travellers": 2
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["data"]["total"] == 0


