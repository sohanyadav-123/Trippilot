from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity,
)
from app.services.auth_service import (
    register_user, authenticate_user, get_user_by_id, update_user_profile,
    change_password, request_password_reset, reset_password, delete_user_account
)
from app.utils.helpers import serialize_doc, success_response, error_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    result = register_user(
        name=data.get("name", ""),
        email=data.get("email", ""),
        password=data.get("password", ""),
        phone=data.get("phone", ""),
    )
    if not result["success"]:
        err_list = result.get("errors", ["Registration failed"])
        primary_msg = err_list[0] if err_list else "Registration failed"
        return error_response(primary_msg, 400, err_list)

    user = result["user"]
    user_id = str(user["_id"])
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return success_response(
        data={
            "user": serialize_doc({k: v for k, v in user.items() if k != "password_hash"}),
            "access_token": access_token,
            "refresh_token": refresh_token,
        },
        message="Registration successful",
        status_code=201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    result = authenticate_user(data.get("email", ""), data.get("password", ""))
    if not result["success"]:
        return error_response(result.get("error", "Invalid email or password."), 401)

    user = result["user"]
    user_id = str(user["_id"])
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return success_response(
        data={
            "user": serialize_doc({k: v for k, v in user.items() if k != "password_hash"}),
            "access_token": access_token,
            "refresh_token": refresh_token,
        },
        message="Login successful",
    )


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return success_response(data={"access_token": access_token}, message="Token refreshed")


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    if not user:
        return error_response("User not found", 404)
    return success_response(
        data=serialize_doc({k: v for k, v in user.items() if k != "password_hash"})
    )


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    update_user_profile(user_id, data)
    user = get_user_by_id(user_id)
    return success_response(
        data=serialize_doc({k: v for k, v in user.items() if k != "password_hash"}),
        message="Profile updated",
    )


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def handle_change_password():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")

    if not old_password or not new_password:
        return error_response("Current and new passwords are required", 400)

    result = change_password(user_id, old_password, new_password)
    if not result["success"]:
        err_msg = result.get("error") or (result.get("errors", ["Password update failed"])[0])
        return error_response(err_msg, 400)

    return success_response(message="Password changed successfully")


@auth_bp.route("/forgot-password", methods=["POST"])
def handle_forgot_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "")
    if not email:
        return error_response("Email address is required", 400)

    result = request_password_reset(email)
    return success_response(data=result, message=result.get("message", "Reset instructions generated"))


@auth_bp.route("/reset-password", methods=["POST"])
def handle_reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token", "")
    new_password = data.get("new_password", "")

    if not token or not new_password:
        return error_response("Token and new password are required", 400)

    result = reset_password(token, new_password)
    if not result["success"]:
        err_msg = result.get("error") or (result.get("errors", ["Password reset failed"])[0])
        return error_response(err_msg, 400)

    return success_response(message="Password reset successfully. You may now log in.")


@auth_bp.route("/delete-account", methods=["POST"])
@jwt_required()
def handle_delete_account():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    password = data.get("password", "")

    if not password:
        return error_response("Password is required to confirm account deletion", 400)

    result = delete_user_account(user_id, password)
    if not result["success"]:
        return error_response(result.get("error", "Account deletion failed"), 400)

    return success_response(message="Account successfully deleted")

