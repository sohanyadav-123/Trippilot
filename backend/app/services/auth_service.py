import bcrypt
from datetime import datetime
from app.utils.db import get_db
from app.utils.validators import validate_email, validate_password
from bson import ObjectId


def register_user(name: str, email: str, password: str, phone: str = "", role: str = "user") -> dict:
    db = get_db()
    errors = []

    if not name or len(name.strip()) < 2:
        errors.append("Name must be at least 2 characters.")
    if not validate_email(email):
        errors.append("Invalid email address.")
    pwd_errors = validate_password(password)
    errors.extend(pwd_errors)

    if errors:
        return {"success": False, "errors": errors}

    if db.users.find_one({"email": email.lower()}):
        return {"success": False, "errors": ["Email already registered."]}

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    now = datetime.utcnow()

    user_doc = {
        "name": name.strip(),
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "phone": phone.strip(),
        "role": role,
        "preferences": {
            "currency": "INR",
            "notifications": True,
            "travel_style": [],
        },
        "created_at": now,
        "updated_at": now,
    }

    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return {"success": True, "user": user_doc}


def authenticate_user(email: str, password: str) -> dict:
    db = get_db()
    user = db.users.find_one({"email": email.lower().strip()})

    if not user:
        return {"success": False, "error": "Invalid email or password."}

    if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        return {"success": False, "error": "Invalid email or password."}

    return {"success": True, "user": user}


def get_user_by_id(user_id: str) -> dict | None:
    db = get_db()
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        return user
    except Exception:
        return None


def update_user_profile(user_id: str, updates: dict) -> dict:
    db = get_db()
    allowed_fields = {"name", "phone", "preferences"}
    filtered = {k: v for k, v in updates.items() if k in allowed_fields}
    filtered["updated_at"] = datetime.utcnow()

    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": filtered})
    return {"success": True}


def change_password(user_id: str, old_password: str, new_password: str) -> dict:
    db = get_db()
    user = get_user_by_id(user_id)
    if not user:
        return {"success": False, "error": "User not found."}

    if not bcrypt.checkpw(old_password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        return {"success": False, "error": "Incorrect current password."}

    pwd_errors = validate_password(new_password)
    if pwd_errors:
        return {"success": False, "errors": pwd_errors}

    new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.utcnow()}}
    )
    return {"success": True}


def request_password_reset(email: str) -> dict:
    db = get_db()
    user = db.users.find_one({"email": email.lower().strip()})
    if not user:
        # Neutral response for security
        return {"success": True, "message": "If an account exists for this email, reset instructions have been generated."}

    import secrets
    from datetime import timedelta
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "reset_token": reset_token,
            "reset_token_expires_at": expires_at,
            "updated_at": datetime.utcnow()
        }}
    )

    return {
        "success": True,
        "message": "If an account exists for this email, reset instructions have been generated.",
        "demo_reset_token": reset_token  # Provided for seamless sandbox/local testing
    }


def reset_password(token: str, new_password: str) -> dict:
    db = get_db()
    user = db.users.find_one({
        "reset_token": token,
        "reset_token_expires_at": {"$gt": datetime.utcnow()}
    })

    if not user:
        return {"success": False, "error": "Invalid or expired password reset token."}

    pwd_errors = validate_password(new_password)
    if pwd_errors:
        return {"success": False, "errors": pwd_errors}

    new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password_hash": new_hash, "updated_at": datetime.utcnow()},
            "$unset": {"reset_token": "", "reset_token_expires_at": ""}
        }
    )
    return {"success": True}


def delete_user_account(user_id: str, password: str) -> dict:
    db = get_db()
    user = get_user_by_id(user_id)
    if not user:
        return {"success": False, "error": "User not found."}

    if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        return {"success": False, "error": "Incorrect password."}

    # Delete or anonymize user records
    db.users.delete_one({"_id": ObjectId(user_id)})
    return {"success": True}

