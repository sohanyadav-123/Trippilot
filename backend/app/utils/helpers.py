import json
from bson import ObjectId
from datetime import datetime
from flask import jsonify
import uuid
import math


class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def serialize_doc(doc):
    """Recursively convert MongoDB doc to JSON-serializable dict."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for k, v in doc.items():
            if k == "_id":
                result["id"] = str(v)
            elif isinstance(v, ObjectId):
                result[k] = str(v)
            elif isinstance(v, datetime):
                result[k] = v.isoformat()
            elif isinstance(v, dict):
                result[k] = serialize_doc(v)
            elif isinstance(v, list):
                result[k] = serialize_doc(v)
            else:
                result[k] = v
        return result
    return doc


def success_response(data=None, message="Success", status_code=200):
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response), status_code


def error_response(message="An error occurred", status_code=400, errors=None):
    response = {"success": False, "message": message}
    if errors:
        response["errors"] = errors
    return jsonify(response), status_code


def paginate(query_cursor, page=1, per_page=20):
    page = max(1, int(page))
    per_page = min(100, max(1, int(per_page)))
    skip = (page - 1) * per_page
    total = query_cursor.count() if hasattr(query_cursor, "count") else 0
    items = list(query_cursor.skip(skip).limit(per_page))
    return {
        "items": [serialize_doc(i) for i in items],
        "page": page,
        "per_page": per_page,
        "total": total,
        "pages": max(1, math.ceil(total / per_page)),
    }


def generate_booking_reference(is_demo: bool = None):
    from config import current_config
    demo = is_demo if is_demo is not None else (current_config.PAYMENT_MODE == "mock")
    ref = uuid.uuid4().hex[:8].upper()
    return f"DEMO-TRP-{ref}" if demo else f"TRP-{ref}"


def generate_idempotency_key():
    return str(uuid.uuid4())

