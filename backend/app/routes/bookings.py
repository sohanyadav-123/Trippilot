from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.booking_service import create_booking, cancel_booking, calculate_booking_total
from app.utils.db import get_db
from app.utils.helpers import serialize_doc, success_response, error_response
from bson import ObjectId

bookings_bp = Blueprint("bookings", __name__)


@bookings_bp.route("", methods=["POST"])
@jwt_required()
def create():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    required = ["selected_items", "traveller_details", "contact", "payment_id"]
    for field in required:
        if not data.get(field):
            return error_response(f"Missing required field: {field}", 400)

    result = create_booking(
        user_id=user_id,
        selected_items=data["selected_items"],
        traveller_details=data["traveller_details"],
        contact=data["contact"],
        payment_id=data["payment_id"],
    )

    if not result["success"]:
        return error_response(result.get("error", "Booking failed"), 400)

    return success_response(
        data=serialize_doc(result["booking"]),
        message="Booking created successfully",
        status_code=201,
    )


@bookings_bp.route("", methods=["GET"])
@jwt_required()
def list_bookings():
    user_id = get_jwt_identity()
    db = get_db()
    status_filter = request.args.get("status")
    query = {"user_id": ObjectId(user_id)}
    if status_filter:
        query["status"] = status_filter
    bookings = list(db.bookings.find(query).sort("created_at", -1))
    return success_response(data={"bookings": [serialize_doc(b) for b in bookings]})


@bookings_bp.route("/<booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id: str):
    user_id = get_jwt_identity()
    db = get_db()
    try:
        booking = db.bookings.find_one({
            "_id": ObjectId(booking_id),
            "user_id": ObjectId(user_id),
        })
        if not booking:
            return error_response("Booking not found", 404)
        return success_response(data=serialize_doc(booking))
    except Exception:
        return error_response("Invalid booking ID", 400)


@bookings_bp.route("/<booking_id>/cancel", methods=["POST"])
@jwt_required()
def cancel(booking_id: str):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    result = cancel_booking(booking_id, user_id, data.get("reason", ""))
    if not result["success"]:
        return error_response(result.get("error", "Cancellation failed"), 400)
    return success_response(message=result["message"])


@bookings_bp.route("/calculate", methods=["POST"])
@jwt_required(optional=True)
def calculate():
    """Preview price without creating a booking."""
    data = request.get_json(silent=True) or {}
    pricing = calculate_booking_total(
        data.get("selected_items", []),
        data.get("travellers", 1),
    )
    if "error" in pricing:
        return error_response(pricing["error"], 400)
    return success_response(data=pricing)
