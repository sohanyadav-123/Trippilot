import uuid
from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from bson import ObjectId
from app.services import ai_service
from app.services.search_service import search_flights, search_hotels
from app.utils.db import get_db
from app.utils.helpers import serialize_doc, success_response, error_response

ai_bp = Blueprint("ai", __name__)


def _get_auth_identity():
    """Returns (user_id_str, session_id_str)."""
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    session_id = request.headers.get("X-Session-ID") or request.args.get("session_id")
    if not session_id:
        data = request.get_json(silent=True) or {}
        session_id = data.get("session_id")

    return user_id, session_id or "default_guest"


def _build_conv_query(conv_id: str, user_id: str, session_id: str):
    q = {}
    if ObjectId.is_valid(conv_id):
        q["_id"] = ObjectId(conv_id)
    else:
        q["conversation_id"] = conv_id

    if user_id:
        q["$or"] = [{"user_id": ObjectId(user_id)}, {"session_id": session_id}]
    else:
        q["session_id"] = session_id
    return q


# ── Recommendations & Itinerary Generation ────────────────────────────────────

@ai_bp.route("/recommendations", methods=["POST"])
def recommendations():
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
        db_hotels=hotels_result.get("hotels", []),
        db_flights=flights_result.get("flights", []),
    )
    return success_response(data=result)


# ── Conversation Lifecycle Endpoints ──────────────────────────────────────────

@ai_bp.route("/conversations", methods=["GET"])
def list_conversations():
    user_id, session_id = _get_auth_identity()
    db = get_db()

    query = {}
    if user_id:
        query = {"$or": [{"user_id": ObjectId(user_id)}, {"session_id": session_id}]}
    else:
        query = {"session_id": session_id}

    convs = list(db.ai_conversations.find(query).sort("updated_at", -1).limit(30))
    formatted = []
    for c in convs:
        c_id = str(c.get("conversation_id") or c.get("_id"))
        msgs = c.get("messages", [])
        formatted.append({
            "id": c_id,
            "title": c.get("title") or (msgs[0].get("content")[:28] if msgs else "New Chat"),
            "created_at": c.get("created_at", datetime.utcnow()).isoformat() if isinstance(c.get("created_at"), datetime) else str(c.get("created_at", "")),
            "updated_at": c.get("updated_at", datetime.utcnow()).isoformat() if isinstance(c.get("updated_at"), datetime) else str(c.get("updated_at", "")),
            "message_count": len(msgs),
            "last_message": msgs[-1].get("content", "") if msgs else "",
        })

    return success_response(data={"conversations": formatted})


@ai_bp.route("/conversations", methods=["POST"])
def create_conversation():
    user_id, session_id = _get_auth_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()
    now = datetime.utcnow()

    new_conv_id = f"conv_{uuid.uuid4().hex[:12]}"
    welcome_msg = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "role": "assistant",
        "content": "Hey! 👋 How can I help you?",
        "created_at": now.isoformat(),
    }

    doc = {
        "conversation_id": new_conv_id,
        "title": data.get("title", "New Trip Consultation"),
        "user_id": ObjectId(user_id) if user_id else None,
        "session_id": session_id,
        "messages": [welcome_msg],
        "created_at": now,
        "updated_at": now,
    }

    db.ai_conversations.insert_one(doc)
    return success_response(data={
        "id": new_conv_id,
        "title": doc["title"],
        "messages": [welcome_msg],
    }, status_code=201)


@ai_bp.route("/conversations/<conversation_id>", methods=["GET"])
def get_conversation(conversation_id: str):
    user_id, session_id = _get_auth_identity()
    db = get_db()

    q = _build_conv_query(conversation_id, user_id, session_id)
    conv = db.ai_conversations.find_one(q)
    if not conv:
        # If not found in DB, return clean structure
        return success_response(data={
            "id": conversation_id,
            "title": "New Chat",
            "messages": [
                {
                    "id": f"msg_init",
                    "role": "assistant",
                    "content": "Hey! 👋 How can I help you?",
                    "created_at": datetime.utcnow().isoformat(),
                }
            ],
        })

    return success_response(data=serialize_doc(conv))


@ai_bp.route("/conversations/<conversation_id>", methods=["DELETE"])
def delete_conversation(conversation_id: str):
    user_id, session_id = _get_auth_identity()
    db = get_db()

    q = _build_conv_query(conversation_id, user_id, session_id)
    res = db.ai_conversations.delete_one(q)
    if res.deleted_count == 0:
        return error_response("Conversation not found or access denied", 404)

    return success_response(message="Conversation deleted successfully")


# ── Chat Execution Endpoint ───────────────────────────────────────────────────

@ai_bp.route("/chat", methods=["POST"])
def chat():
    user_id, session_id = _get_auth_identity()
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    context = data.get("context", {})
    conv_id = data.get("conversation_id") or data.get("session_id") or f"conv_{uuid.uuid4().hex[:12]}"

    if not messages:
        return error_response("Messages array cannot be empty", 400)

    now = datetime.utcnow()
    db = get_db()

    # Ensure message IDs exist
    for m in messages:
        if "id" not in m:
            m["id"] = f"msg_{uuid.uuid4().hex[:8]}"
        if "created_at" not in m:
            m["created_at"] = now.isoformat()

    # Call AI service with full history and smart context
    result = ai_service.chat(messages, context)
    reply_text = result.get("reply") or result.get("message") or "Hey! How can I assist you with your travels?"

    assistant_msg = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "role": "assistant",
        "content": reply_text,
        "created_at": datetime.utcnow().isoformat(),
        "actions": result.get("actions", []),
        "suggestions": result.get("suggestions", []),
    }

    # Auto-generate title if this is the first user message
    user_msgs = [m for m in messages if m.get("role") == "user"]
    auto_title = None
    if len(user_msgs) == 1:
        auto_title = ai_service.generate_conversation_title(user_msgs[0].get("content", ""))

    # Save to MongoDB
    all_updated_messages = messages + [assistant_msg]
    q = _build_conv_query(conv_id, user_id, session_id)

    update_set = {
        "messages": all_updated_messages,
        "updated_at": now,
        "context": context,
    }
    set_on_insert = {
        "conversation_id": conv_id,
        "user_id": ObjectId(user_id) if user_id else None,
        "session_id": session_id,
        "created_at": now,
    }
    if auto_title:
        update_set["title"] = auto_title
    else:
        set_on_insert["title"] = "Trip Consultation"

    db.ai_conversations.update_one(
        q,
        {
            "$set": update_set,
            "$setOnInsert": set_on_insert,
        },
        upsert=True,
    )

    return success_response(data={
        "id": assistant_msg["id"],
        "conversation_id": conv_id,
        "title": auto_title,
        "role": "assistant",
        "content": reply_text,
        "reply": reply_text,
        "message": reply_text,
        "suggestions": result.get("suggestions", []),
        "actions": result.get("actions", []),
        "messages": all_updated_messages,
    })


# ── Edit and Delete Message Endpoints ─────────────────────────────────────────

@ai_bp.route("/conversations/<conversation_id>/messages/<message_id>", methods=["PUT"])
def edit_message(conversation_id: str, message_id: str):
    """
    Edits a user message, truncates following messages, and regenerates assistant response.
    """
    user_id, session_id = _get_auth_identity()
    data = request.get_json(silent=True) or {}
    new_content = data.get("content", "").strip()
    context = data.get("context", {})

    if not new_content:
        return error_response("New message content cannot be empty", 400)

    db = get_db()
    q = _build_conv_query(conversation_id, user_id, session_id)
    conv = db.ai_conversations.find_one(q)
    if not conv:
        return error_response("Conversation not found", 404)

    existing_messages = conv.get("messages", [])
    # Find the target message
    target_idx = -1
    for idx, m in enumerate(existing_messages):
        if m.get("id") == message_id:
            target_idx = idx
            break

    if target_idx == -1:
        return error_response("Message not found in this conversation", 404)

    # Truncate thread to target message and update its content
    truncated_thread = existing_messages[:target_idx]
    updated_user_msg = {
        **existing_messages[target_idx],
        "content": new_content,
        "updated_at": datetime.utcnow().isoformat(),
    }
    thread_for_ai = truncated_thread + [updated_user_msg]

    # Regenerate assistant reply
    result = ai_service.chat(thread_for_ai, context)
    reply_text = result.get("reply") or result.get("message") or "Updated response."

    new_assistant_msg = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "role": "assistant",
        "content": reply_text,
        "created_at": datetime.utcnow().isoformat(),
        "actions": result.get("actions", []),
        "suggestions": result.get("suggestions", []),
    }

    final_messages = thread_for_ai + [new_assistant_msg]
    now = datetime.utcnow()

    db.ai_conversations.update_one(
        q,
        {
            "$set": {
                "messages": final_messages,
                "updated_at": now,
            }
        }
    )

    return success_response(data={
        "conversation_id": conversation_id,
        "messages": final_messages,
        "reply": reply_text,
    })


@ai_bp.route("/conversations/<conversation_id>/messages/<message_id>", methods=["DELETE"])
def delete_message(conversation_id: str, message_id: str):
    """
    Deletes a user message and any immediately subsequent assistant message.
    """
    user_id, session_id = _get_auth_identity()
    db = get_db()
    q = _build_conv_query(conversation_id, user_id, session_id)
    conv = db.ai_conversations.find_one(q)
    if not conv:
        return error_response("Conversation not found", 404)

    existing_messages = conv.get("messages", [])
    target_idx = -1
    for idx, m in enumerate(existing_messages):
        if m.get("id") == message_id:
            target_idx = idx
            break

    if target_idx == -1:
        return error_response("Message not found", 404)

    # If deleting a user message that has an assistant reply immediately following it, remove both
    if existing_messages[target_idx].get("role") == "user" and target_idx + 1 < len(existing_messages) and existing_messages[target_idx + 1].get("role") == "assistant":
        final_messages = existing_messages[:target_idx] + existing_messages[target_idx + 2:]
    else:
        final_messages = existing_messages[:target_idx] + existing_messages[target_idx + 1:]

    db.ai_conversations.update_one(
        q,
        {
            "$set": {
                "messages": final_messages,
                "updated_at": datetime.utcnow(),
            }
        }
    )

    return success_response(data={
        "conversation_id": conversation_id,
        "messages": final_messages,
    })


# ── Budget Optimization & Modification ───────────────────────────────────────

@ai_bp.route("/optimize-budget", methods=["POST"])
@jwt_required()
def optimize_budget():
    data = request.get_json(silent=True) or {}
    budget_data = data.get("budget", {})
    itinerary = data.get("itinerary", {})

    result = ai_service.get_budget_suggestions(budget_data)
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
