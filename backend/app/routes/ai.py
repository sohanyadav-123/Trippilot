from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.services import ai_service
from app.services.search_service import search_flights, search_hotels, search_destinations
from app.utils.db import get_db
from app.utils.helpers import serialize_doc, success_response, error_response
from bson import ObjectId
from datetime import datetime

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/recommendations", methods=["POST"])
def recommendations():
    # Allow unauthenticated for recommendations
    data = request.get_json(silent=True) or {}
    db = get_db()

    destinations = list(db.destinations.find({}).limit(20))
    result = ai_service.get_destination_recommendations(data, destinations)
    return success_response(data=result)


@ai_bp.route("/itinerary", methods=["POST"])
def generate_itinerary():
    data = request.get_json(silent=True) or {}
    destination = data.get("destination", "")
    city = destination.split(",")[0].strip() if "," in destination else destination

    hotels_result = search_hotels(city=city, per_page=5)
    flights_result = search_flights(
        origin=data.get("origin", ""),
        destination=city,
        departure_date=data.get("start_date", ""),
        passengers=data.get("travellers", 1),
        per_page=5,
    )

    result = ai_service.generate_itinerary(
        params=data,
        db_hotels=hotels_result["hotels"],
        db_flights=flights_result["flights"],
    )
    return success_response(data=result)


@ai_bp.route("/chat", methods=["POST"])
def chat():
    # Optional auth
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        from flask_jwt_extended import get_jwt_identity
        user_id = get_jwt_identity()
    except Exception:
        pass

    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    context = data.get("context", {})

    result = ai_service.chat(messages, context)

    # Save conversation if user is logged in
    if user_id:
        db = get_db()
        now = datetime.utcnow()
        db.ai_conversations.update_one(
            {"user_id": ObjectId(user_id), "session_id": data.get("session_id", "default")},
            {
                "$push": {"messages": {"$each": messages[-2:]}},
                "$set": {"updated_at": now},
                "$setOnInsert": {"created_at": now, "context": context},
            },
            upsert=True,
        )

    return success_response(data=result)


@ai_bp.route("/optimize-budget", methods=["POST"])
@jwt_required()
def optimize_budget():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()

    budget_data = data.get("budget", {})
    itinerary = data.get("itinerary", {})

    result = ai_service.optimize_budget(budget_data, itinerary)
    return success_response(data=result)


@ai_bp.route("/modify-itinerary", methods=["POST"])
@jwt_required()
def modify_itinerary():
    data = request.get_json(silent=True) or {}
    modification_type = data.get("modification_type", "cheaper")
    itinerary = data.get("itinerary", {})
    params = data.get("params", {})

    valid_types = {"cheaper", "adventure", "family", "reduce_travel", "luxury"}
    if modification_type not in valid_types:
        return error_response(f"Invalid modification_type. Must be one of: {', '.join(valid_types)}", 400)

    result = ai_service.modify_itinerary(itinerary, modification_type, params)
    return success_response(data=result)


@ai_bp.route("/conversations", methods=["GET"])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    db = get_db()
    conversations = list(db.ai_conversations.find({"user_id": ObjectId(user_id)}).sort("updated_at", -1).limit(10))
    return success_response(data={"conversations": [serialize_doc(c) for c in conversations]})
