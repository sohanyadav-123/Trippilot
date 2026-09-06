from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.db import get_db
from app.utils.helpers import serialize_doc, success_response, error_response
from bson import ObjectId
from datetime import datetime
import uuid

budgets_bp = Blueprint("budgets", __name__)

EXCHANGE_RATES_TO_INR = {
    "INR": 1.0,
    "USD": 83.5,
    "AED": 22.7,
    "EUR": 90.2,
    "GBP": 105.8,
    "SGD": 62.1,
    "THB": 2.35,
    "JPY": 0.55,
}


def convert_to_base(amount: float, from_curr: str, to_curr: str = "INR") -> float:
    from_rate = EXCHANGE_RATES_TO_INR.get(from_curr.upper(), 1.0)
    to_rate = EXCHANGE_RATES_TO_INR.get(to_curr.upper(), 1.0)
    in_inr = amount * from_rate
    return round(in_inr / to_rate, 2)


@budgets_bp.route("/currency/rates", methods=["GET"])
def get_currency_rates():
    rates = [
        {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "rateAgainstINR": 1.0, "flag": "🇮🇳"},
        {"code": "USD", "name": "US Dollar", "symbol": "$", "rateAgainstINR": 83.5, "flag": "🇺🇸"},
        {"code": "AED", "name": "UAE Dirham", "symbol": "AED", "rateAgainstINR": 22.7, "flag": "🇦🇪"},
        {"code": "EUR", "name": "Euro", "symbol": "€", "rateAgainstINR": 90.2, "flag": "🇪🇺"},
        {"code": "GBP", "name": "British Pound", "symbol": "£", "rateAgainstINR": 105.8, "flag": "🇬🇧"},
        {"code": "SGD", "name": "Singapore Dollar", "symbol": "S$", "rateAgainstINR": 62.1, "flag": "🇸🇬"},
        {"code": "THB", "name": "Thai Baht", "symbol": "฿", "rateAgainstINR": 2.35, "flag": "🇹🇭"},
        {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "rateAgainstINR": 0.55, "flag": "🇯🇵"},
    ]
    return success_response(data={"rates": rates, "last_updated": datetime.utcnow().isoformat()})


@budgets_bp.route("", methods=["POST"])
@jwt_required()
def create_budget():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()
    now = datetime.utcnow()

    total_budget = float(data.get("total_budget", 0))
    base_currency = data.get("currency", "INR")
    doc = {
        "user_id": ObjectId(user_id),
        "itinerary_id": data.get("itinerary_id"),
        "trip_name": data.get("trip_name", "My Trip"),
        "currency": base_currency,
        "total_budget": total_budget,
        "categories": {
            "flights": float(data.get("categories", {}).get("flights", 0)),
            "hotels": float(data.get("categories", {}).get("hotels", 0)),
            "food": float(data.get("categories", {}).get("food", 0)),
            "activities": float(data.get("categories", {}).get("activities", 0)),
            "local_transport": float(data.get("categories", {}).get("local_transport", 0)),
            "shopping": float(data.get("categories", {}).get("shopping", 0)),
            "miscellaneous": float(data.get("categories", {}).get("miscellaneous", 0)),
        },
        "expenses": [],
        "price_alerts": [],
        "spent_amount": 0,
        "remaining_amount": total_budget,
        "created_at": now,
        "updated_at": now,
    }

    result = db.budgets.insert_one(doc)
    doc["_id"] = result.inserted_id
    return success_response(data=serialize_doc(doc), status_code=201)


@budgets_bp.route("/<budget_id>", methods=["GET"])
@jwt_required()
def get_budget(budget_id: str):
    user_id = get_jwt_identity()
    db = get_db()
    try:
        budget = db.budgets.find_one({"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)})
        if not budget:
            return error_response("Budget not found", 404)
        return success_response(data=serialize_doc(budget))
    except Exception:
        return error_response("Invalid ID", 400)


@budgets_bp.route("/<budget_id>", methods=["PUT"])
@jwt_required()
def update_budget(budget_id: str):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()
    allowed = {"total_budget", "categories", "trip_name", "currency"}
    updates = {k: v for k, v in data.items() if k in allowed}
    if "total_budget" in updates:
        budget = db.budgets.find_one({"_id": ObjectId(budget_id)})
        if budget:
            updates["remaining_amount"] = float(updates["total_budget"]) - budget.get("spent_amount", 0)
    updates["updated_at"] = datetime.utcnow()

    db.budgets.update_one({"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)}, {"$set": updates})
    return success_response(message="Budget updated")


@budgets_bp.route("/<budget_id>/expenses", methods=["POST"])
@jwt_required()
def add_expense(budget_id: str):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()

    budget = db.budgets.find_one({"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)})
    if not budget:
        return error_response("Budget not found", 404)

    base_curr = budget.get("currency", "INR")
    exp_curr = data.get("currency", base_curr)
    raw_amount = float(data.get("amount", 0))
    converted = convert_to_base(raw_amount, exp_curr, base_curr)

    expense = {
        "id": str(uuid.uuid4()),
        "category": data.get("category", "miscellaneous"),
        "description": data.get("description", ""),
        "amount": raw_amount,
        "currency": exp_curr,
        "base_currency": base_curr,
        "converted_amount": converted,
        "date": data.get("date", datetime.utcnow().isoformat()),
        "paid_by": data.get("paid_by", "You"),
        "participants": data.get("participants", []),
        "split_mode": data.get("split_mode", "equal"),
        "notes": data.get("notes", ""),
        "settlement_status": data.get("settlement_status", "unsettled"),
        "created_at": datetime.utcnow(),
    }

    new_spent = budget.get("spent_amount", 0) + converted
    db.budgets.update_one(
        {"_id": ObjectId(budget_id)},
        {
            "$push": {"expenses": expense},
            "$set": {
                "spent_amount": new_spent,
                "remaining_amount": budget["total_budget"] - new_spent,
                "updated_at": datetime.utcnow(),
            },
        }
    )
    return success_response(data={"expense": expense}, status_code=201)


@budgets_bp.route("/<budget_id>/expenses/<expense_id>", methods=["PUT"])
@jwt_required()
def update_expense(budget_id: str, expense_id: str):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()

    budget = db.budgets.find_one({"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)})
    if not budget:
        return error_response("Budget not found", 404)

    expenses = budget.get("expenses", [])
    exp_idx = next((i for i, e in enumerate(expenses) if e["id"] == expense_id), None)
    if exp_idx is None:
        return error_response("Expense not found", 404)

    target_exp = expenses[exp_idx]
    base_curr = budget.get("currency", "INR")
    exp_curr = data.get("currency", target_exp.get("currency", base_curr))
    raw_amount = float(data.get("amount", target_exp.get("amount", 0)))
    converted = convert_to_base(raw_amount, exp_curr, base_curr)

    updated_exp = {
        **target_exp,
        "category": data.get("category", target_exp.get("category")),
        "description": data.get("description", target_exp.get("description")),
        "amount": raw_amount,
        "currency": exp_curr,
        "base_currency": base_curr,
        "converted_amount": converted,
        "date": data.get("date", target_exp.get("date")),
        "paid_by": data.get("paid_by", target_exp.get("paid_by")),
        "participants": data.get("participants", target_exp.get("participants")),
        "split_mode": data.get("split_mode", target_exp.get("split_mode")),
        "notes": data.get("notes", target_exp.get("notes")),
        "settlement_status": data.get("settlement_status", target_exp.get("settlement_status")),
        "updated_at": datetime.utcnow(),
    }
    expenses[exp_idx] = updated_exp

    total_spent = sum(e.get("converted_amount", e.get("amount", 0)) for e in expenses)
    db.budgets.update_one(
        {"_id": ObjectId(budget_id)},
        {
            "$set": {
                "expenses": expenses,
                "spent_amount": total_spent,
                "remaining_amount": budget["total_budget"] - total_spent,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    return success_response(data={"expense": updated_exp}, message="Expense updated")


@budgets_bp.route("/<budget_id>/expenses/<expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(budget_id: str, expense_id: str):
    user_id = get_jwt_identity()
    db = get_db()

    budget = db.budgets.find_one({"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)})
    if not budget:
        return error_response("Budget not found", 404)

    expense = next((e for e in budget.get("expenses", []) if e["id"] == expense_id), None)
    if not expense:
        return error_response("Expense not found", 404)

    amt = expense.get("converted_amount", expense.get("amount", 0))
    new_spent = max(0, budget.get("spent_amount", 0) - amt)
    db.budgets.update_one(
        {"_id": ObjectId(budget_id)},
        {
            "$pull": {"expenses": {"id": expense_id}},
            "$set": {
                "spent_amount": new_spent,
                "remaining_amount": budget["total_budget"] - new_spent,
                "updated_at": datetime.utcnow(),
            },
        }
    )
    return success_response(message="Expense deleted")


@budgets_bp.route("/<budget_id>/expenses/<expense_id>/settle", methods=["PATCH"])
@jwt_required()
def toggle_expense_settle(budget_id: str, expense_id: str):
    user_id = get_jwt_identity()
    db = get_db()

    budget = db.budgets.find_one({"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)})
    if not budget:
        return error_response("Budget not found", 404)

    expenses = budget.get("expenses", [])
    target = next((e for e in expenses if e["id"] == expense_id), None)
    if not target:
        return error_response("Expense not found", 404)

    new_status = "settled" if target.get("settlement_status") != "settled" else "unsettled"
    target["settlement_status"] = new_status

    db.budgets.update_one(
        {"_id": ObjectId(budget_id), "expenses.id": expense_id},
        {"$set": {"expenses.$.settlement_status": new_status, "updated_at": datetime.utcnow()}}
    )
    return success_response(data={"settlement_status": new_status})


@budgets_bp.route("/<budget_id>/price-alerts", methods=["GET", "POST"])
@jwt_required()
def manage_price_alerts(budget_id: str):
    user_id = get_jwt_identity()
    db = get_db()

    budget = db.budgets.find_one({"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)})
    if not budget:
        return error_response("Budget not found", 404)

    if request.method == "GET":
        return success_response(data={"price_alerts": budget.get("price_alerts", [])})

    data = request.get_json(silent=True) or {}
    new_alert = {
        "id": str(uuid.uuid4()),
        "type": data.get("type", "flight"),
        "title": data.get("title", "Price Alert"),
        "target_price": float(data.get("target_price", 0)),
        "current_price": float(data.get("current_price", 0)),
        "currency": data.get("currency", "INR"),
        "status": "active",
        "last_checked": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat(),
    }

    db.budgets.update_one(
        {"_id": ObjectId(budget_id)},
        {"$push": {"price_alerts": new_alert}, "$set": {"updated_at": datetime.utcnow()}}
    )
    return success_response(data={"price_alert": new_alert}, status_code=201)


@budgets_bp.route("/<budget_id>/price-alerts/<alert_id>", methods=["DELETE"])
@jwt_required()
def delete_price_alert(budget_id: str, alert_id: str):
    user_id = get_jwt_identity()
    db = get_db()

    db.budgets.update_one(
        {"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)},
        {"$pull": {"price_alerts": {"id": alert_id}}, "$set": {"updated_at": datetime.utcnow()}}
    )
    return success_response(message="Price alert removed")


@budgets_bp.route("/trip/<trip_id>", methods=["GET"])
@jwt_required()
def get_budget_by_trip(trip_id: str):
    user_id = get_jwt_identity()
    db = get_db()
    budget = db.budgets.find_one({"itinerary_id": trip_id, "user_id": ObjectId(user_id)})
    if not budget:
        return error_response("Budget not found", 404)
    return success_response(data=serialize_doc(budget))
