import re
from marshmallow import ValidationError


def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password(password: str) -> list:
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters.")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")
    if not re.search(r"[0-9]", password):
        errors.append("Password must contain at least one number.")
    return errors


def sanitize_string(value: str, max_length: int = 500) -> str:
    if not isinstance(value, str):
        return ""
    # Strip HTML tags
    cleaned = re.sub(r"<[^>]+>", "", value)
    return cleaned.strip()[:max_length]


def validate_phone(phone: str) -> bool:
    pattern = r"^\+?[1-9]\d{6,14}$"
    return bool(re.match(pattern, phone.replace(" ", "").replace("-", "")))
