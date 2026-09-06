import uuid
import logging
from datetime import datetime
from app.utils.db import get_db
from app.utils.helpers import generate_booking_reference
from bson import ObjectId
from config import current_config

logger = logging.getLogger(__name__)


def calculate_booking_total(selected_items: list, travellers: int = 1) -> dict:
    """Server-side price calculation — never trust client totals."""
    db = get_db()
    subtotal = 0
    breakdown = []

    for item in selected_items:
        item_type = item.get("type")
        item_id = item.get("id")
        quantity = item.get("quantity", travellers)

        if item_type == "flight":
            doc = db.flights.find_one({"_id": ObjectId(item_id)})
            if doc and doc.get("seats_available", 0) >= quantity:
                price = doc["price"] * quantity
                subtotal += price
                breakdown.append({"type": "flight", "id": item_id, "price": price,
                                   "description": f"{doc['airline']} {doc['flight_number']}", "unit_price": doc["price"], "quantity": quantity})
            else:
                return {"error": f"Flight {item_id} unavailable or insufficient seats."}

        elif item_type == "hotel":
            doc = db.hotels.find_one({"_id": ObjectId(item_id)})
            nights = item.get("nights", 1)
            rooms = item.get("rooms", 1)
            if doc and doc.get("available_rooms", 0) >= rooms:
                price = doc["price_per_night"] * nights * rooms
                subtotal += price
                breakdown.append({"type": "hotel", "id": item_id, "price": price,
                                   "description": f"{doc['name']} ({nights} nights, {rooms} room(s))",
                                   "unit_price": doc["price_per_night"], "quantity": nights * rooms})
            else:
                return {"error": f"Hotel {item_id} unavailable or insufficient rooms."}

    taxes = round(subtotal * 0.05, 2)  # 5% GST
    service_fee = round(subtotal * 0.015, 2)  # 1.5% service fee
    total = round(subtotal + taxes + service_fee, 2)

    return {
        "subtotal": subtotal,
        "taxes": taxes,
        "service_fee": service_fee,
        "total": total,
        "currency": current_config.CURRENCY,
        "breakdown": breakdown,
    }


def create_booking(user_id: str, selected_items: list, traveller_details: list,
                   contact: dict, payment_id: str) -> dict:
    db = get_db()
    pricing = calculate_booking_total(selected_items, len(traveller_details))
    if "error" in pricing:
        return {"success": False, "error": pricing["error"]}

    now = datetime.utcnow()
    booking_ref = generate_booking_reference()

    booking_doc = {
        "booking_reference": booking_ref,
        "user_id": ObjectId(user_id),
        "selected_items": selected_items,
        "traveller_details": traveller_details,
        "contact": contact,
        "total_amount": pricing["total"],
        "subtotal": pricing["subtotal"],
        "taxes": pricing["taxes"],
        "service_fee": pricing["service_fee"],
        "currency": pricing["currency"],
        "breakdown": pricing["breakdown"],
        "payment_id": payment_id,
        "status": "confirmed",
        "cancellation_details": None,
        "created_at": now,
        "updated_at": now,
    }

    # Reduce inventory
    for item in pricing["breakdown"]:
        if item["type"] == "flight":
            db.flights.update_one(
                {"_id": ObjectId(item["id"])},
                {"$inc": {"seats_available": -item["quantity"]}}
            )
        elif item["type"] == "hotel":
            db.hotels.update_one(
                {"_id": ObjectId(item["id"])},
                {"$inc": {"available_rooms": -1}}
            )

    result = db.bookings.insert_one(booking_doc)
    booking_doc["_id"] = result.inserted_id
    return {"success": True, "booking": booking_doc}


def cancel_booking(booking_id: str, user_id: str, reason: str = "") -> dict:
    db = get_db()
    try:
        booking = db.bookings.find_one({
            "_id": ObjectId(booking_id),
            "user_id": ObjectId(user_id),
        })
        if not booking:
            return {"success": False, "error": "Booking not found."}
        if booking["status"] in ("cancelled", "completed"):
            return {"success": False, "error": f"Cannot cancel a {booking['status']} booking."}

        db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {
                "status": "cancelled",
                "cancellation_details": {"reason": reason, "cancelled_at": datetime.utcnow()},
                "updated_at": datetime.utcnow(),
            }}
        )
        return {"success": True, "message": "Booking cancelled successfully."}
    except Exception as e:
        logger.error(f"Cancel booking error: {e}")
        return {"success": False, "error": "Failed to cancel booking."}
