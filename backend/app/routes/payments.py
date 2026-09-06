from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.payment_service import create_payment_intent, confirm_payment, get_payment
from app.utils.helpers import serialize_doc, success_response, error_response
import uuid

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("/create", methods=["POST"])
@jwt_required()
def create():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    if not data.get("amount"):
        return error_response("Amount is required", 400)

    idempotency_key = data.get("idempotency_key") or str(uuid.uuid4())

    result = create_payment_intent(
        user_id=user_id,
        amount=float(data["amount"]),
        currency=data.get("currency", "INR"),
        idempotency_key=idempotency_key,
        metadata=data.get("metadata", {}),
    )

    if not result["success"]:
        return error_response("Payment creation failed", 500)

    return success_response(data=result, status_code=201)


@payments_bp.route("/confirm", methods=["POST"])
@jwt_required()
def confirm():
    data = request.get_json(silent=True) or {}
    payment_id = data.get("payment_id")

    if not payment_id:
        return error_response("payment_id is required", 400)

    result = confirm_payment(payment_id, data.get("payment_method", "mock"))

    if not result["success"]:
        return error_response(result.get("error", "Payment failed"), 400)

    return success_response(data=result, message="Payment confirmed")


@payments_bp.route("/<payment_id>", methods=["GET"])
@jwt_required()
def payment_status(payment_id: str):
    payment = get_payment(payment_id)
    if not payment:
        return error_response("Payment not found", 404)
    safe = {k: v for k, v in payment.items() if k not in ("idempotency_key",)}
    return success_response(data=serialize_doc(safe))
