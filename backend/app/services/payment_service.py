import uuid
import logging
from datetime import datetime
from app.utils.db import get_db
from bson import ObjectId
from config import current_config

logger = logging.getLogger(__name__)

MOCK_MODE = current_config.PAYMENT_MODE == "mock"


def create_payment_intent(user_id: str, amount: float, currency: str,
                           idempotency_key: str, metadata: dict = None) -> dict:
    db = get_db()

    # Idempotency check
    existing = db.payments.find_one({"idempotency_key": idempotency_key})
    if existing:
        return {"success": True, "payment_id": str(existing["_id"]),
                "status": existing["status"], "duplicate": True}

    now = datetime.utcnow()
    payment_doc = {
        "user_id": ObjectId(user_id),
        "amount": round(amount, 2),
        "currency": currency or current_config.CURRENCY,
        "status": "pending",
        "idempotency_key": idempotency_key,
        "mode": "mock" if MOCK_MODE else "live",
        "metadata": metadata or {},
        "provider_reference": None,
        "created_at": now,
        "updated_at": now,
    }

    result = db.payments.insert_one(payment_doc)
    payment_id = str(result.inserted_id)

    if MOCK_MODE:
        # Auto-approve in mock mode
        mock_ref = f"MOCK-{uuid.uuid4().hex[:12].upper()}"
        db.payments.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "pending", "provider_reference": mock_ref, "updated_at": now}}
        )
        return {"success": True, "payment_id": payment_id, "status": "pending",
                "mock_reference": mock_ref, "mode": "mock"}

    return {"success": True, "payment_id": payment_id, "status": "pending", "mode": "live"}


def confirm_payment(payment_id: str, payment_method: str = "mock") -> dict:
    db = get_db()
    try:
        payment = db.payments.find_one({"_id": ObjectId(payment_id)})
        if not payment:
            return {"success": False, "error": "Payment not found."}

        if payment["status"] == "successful":
            return {"success": True, "status": "successful", "already_confirmed": True}

        if MOCK_MODE:
            # Mock: always succeed
            db.payments.update_one(
                {"_id": ObjectId(payment_id)},
                {"$set": {"status": "successful", "payment_method": payment_method,
                           "confirmed_at": datetime.utcnow(), "updated_at": datetime.utcnow()}}
            )
            return {"success": True, "status": "successful", "mode": "mock"}

        return {"success": False, "error": "Live payment confirmation not implemented."}

    except Exception as e:
        logger.error(f"Confirm payment error: {e}")
        return {"success": False, "error": "Payment confirmation failed."}


def get_payment(payment_id: str) -> dict | None:
    db = get_db()
    try:
        return db.payments.find_one({"_id": ObjectId(payment_id)})
    except Exception:
        return None
