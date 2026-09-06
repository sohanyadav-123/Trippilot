from flask import Blueprint, request
from app.services.search_service import (
    search_flights,
    search_hotels,
    search_destinations,
    get_destination_by_id,
    search_trains,
    search_buses,
)
from app.utils.helpers import serialize_doc, success_response, error_response

search_bp = Blueprint("search", __name__)


@search_bp.route("/search/flights", methods=["GET"])
def flights():
    args = request.args
    try:
        filters = {}
        if args.get("airline"):
            filters["airline"] = args.getlist("airline")
        if args.get("stops"):
            filters["stops"] = int(args.get("stops"))
        if args.get("max_price"):
            filters["max_price"] = float(args.get("max_price"))
        if args.get("min_price"):
            filters["min_price"] = float(args.get("min_price"))

        result = search_flights(
            origin=args.get("origin", ""),
            destination=args.get("destination", ""),
            departure_date=args.get("departure_date", ""),
            return_date=args.get("return_date"),
            passengers=int(args.get("passengers", 1)),
            cabin_class=args.get("cabin_class", "economy"),
            page=int(args.get("page", 1)),
            per_page=int(args.get("per_page", 20)),
            sort_by=args.get("sort_by", "price"),
            filters=filters,
        )

        result["flights"] = [serialize_doc(f) for f in result["flights"]]
        return success_response(data=result)
    except Exception as e:
        return error_response(str(e), 500)


@search_bp.route("/search/hotels", methods=["GET"])
def hotels():
    args = request.args
    try:
        filters = {}
        if args.get("max_price"):
            filters["max_price"] = float(args.get("max_price"))
        if args.get("min_price"):
            filters["min_price"] = float(args.get("min_price"))
        if args.get("min_rating"):
            filters["min_rating"] = float(args.get("min_rating"))
        if args.get("amenities"):
            filters["amenities"] = args.getlist("amenities")

        result = search_hotels(
            city=args.get("city", ""),
            country=args.get("country", ""),
            check_in=args.get("check_in", ""),
            check_out=args.get("check_out", ""),
            guests=int(args.get("guests", 1)),
            rooms=int(args.get("rooms", 1)),
            page=int(args.get("page", 1)),
            per_page=int(args.get("per_page", 20)),
            sort_by=args.get("sort_by", "recommended"),
            filters=filters,
        )

        result["hotels"] = [serialize_doc(h) for h in result["hotels"]]
        return success_response(data=result)
    except Exception as e:
        return error_response(str(e), 500)


@search_bp.route("/search/trains", methods=["GET"])
def trains():
    args = request.args
    try:
        result = search_trains(
            origin=args.get("origin", "Delhi"),
            destination=args.get("destination", "Goa"),
            date=args.get("departure_date", ""),
            travellers=int(args.get("passengers", 1)),
            train_class=args.get("class", "All"),
        )
        return success_response(data=result)
    except Exception as e:
        return error_response(str(e), 500)


@search_bp.route("/search/buses", methods=["GET"])
def buses():
    args = request.args
    try:
        result = search_buses(
            origin=args.get("origin", "Delhi"),
            destination=args.get("destination", "Goa"),
            date=args.get("departure_date", ""),
            passengers=int(args.get("passengers", 1)),
        )
        return success_response(data=result)
    except Exception as e:
        return error_response(str(e), 500)


@search_bp.route("/search/destinations", methods=["GET"])
@search_bp.route("/destinations", methods=["GET"])
def destinations():
    args = request.args
    result = search_destinations(
        query_str=args.get("q", ""),
        featured=args.get("featured", "").lower() == "true",
        page=int(args.get("page", 1)),
        per_page=int(args.get("per_page", 20)),
    )
    result["destinations"] = [serialize_doc(d) for d in result["destinations"]]
    return success_response(data=result)


@search_bp.route("/destinations/<destination_id>", methods=["GET"])
def destination_detail(destination_id: str):
    dest = get_destination_by_id(destination_id)
    if not dest:
        return error_response("Destination not found", 404)
    return success_response(data=serialize_doc(dest))
