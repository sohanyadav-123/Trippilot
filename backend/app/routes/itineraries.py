from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.db import get_db
from app.utils.helpers import serialize_doc, success_response, error_response
from bson import ObjectId
from datetime import datetime

itineraries_bp = Blueprint("itineraries", __name__)


@itineraries_bp.route("", methods=["POST"])
@jwt_required()
def create():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()
    now = datetime.utcnow()

    doc = {
        "user_id": ObjectId(user_id),
        "title": data.get("title", "My Trip"),
        "destination": data.get("destination", ""),
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "travellers": data.get("travellers", 1),
        "days": data.get("days", []),
        "estimated_cost": data.get("estimated_cost", 0),
        "budget_id": data.get("budget_id"),
        "ai_generated": data.get("ai_generated", False),
        "summary": data.get("summary", ""),
        "created_at": now,
        "updated_at": now,
    }

    result = db.itineraries.insert_one(doc)
    doc["_id"] = result.inserted_id
    return success_response(data=serialize_doc(doc), status_code=201)


@itineraries_bp.route("", methods=["GET"])
@jwt_required()
def list_itineraries():
    user_id = get_jwt_identity()
    db = get_db()
    items = list(db.itineraries.find({"user_id": ObjectId(user_id)}).sort("created_at", -1))
    return success_response(data={"itineraries": [serialize_doc(i) for i in items]})


@itineraries_bp.route("/<itinerary_id>", methods=["GET"])
@jwt_required()
def get_itinerary(itinerary_id: str):
    user_id = get_jwt_identity()
    db = get_db()
    try:
        item = db.itineraries.find_one({"_id": ObjectId(itinerary_id), "user_id": ObjectId(user_id)})
        if not item:
            return error_response("Itinerary not found", 404)
        return success_response(data=serialize_doc(item))
    except Exception:
        return error_response("Invalid ID", 400)


@itineraries_bp.route("/<itinerary_id>", methods=["PUT"])
@jwt_required()
def update_itinerary(itinerary_id: str):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()
    allowed = {"title", "destination", "start_date", "end_date", "travellers", "days", "estimated_cost", "summary"}
    updates = {k: v for k, v in data.items() if k in allowed}
    updates["updated_at"] = datetime.utcnow()

    result = db.itineraries.update_one(
        {"_id": ObjectId(itinerary_id), "user_id": ObjectId(user_id)},
        {"$set": updates}
    )
    if result.matched_count == 0:
        return error_response("Itinerary not found", 404)
    return success_response(message="Itinerary updated")


@itineraries_bp.route("/<itinerary_id>", methods=["DELETE"])
@jwt_required()
def delete_itinerary(itinerary_id: str):
    user_id = get_jwt_identity()
    db = get_db()
    result = db.itineraries.delete_one({"_id": ObjectId(itinerary_id), "user_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        return error_response("Itinerary not found", 404)
    return success_response(message="Itinerary deleted")
