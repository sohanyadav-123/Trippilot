from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import current_config
from datetime import timedelta


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config["SECRET_KEY"] = current_config.SECRET_KEY
    app.config["JWT_SECRET_KEY"] = current_config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=current_config.JWT_ACCESS_TOKEN_EXPIRES)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(seconds=current_config.JWT_REFRESH_TOKEN_EXPIRES)
    app.config["DEBUG"] = current_config.DEBUG

    # CORS
    CORS(
        app,
        origins=[
            current_config.FRONTEND_URL,
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ],
        supports_credentials=True,
    )

    # JWT
    JWTManager(app)

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.search import search_bp
    from app.routes.bookings import bookings_bp
    from app.routes.payments import payments_bp
    from app.routes.itineraries import itineraries_bp
    from app.routes.budgets import budgets_bp
    from app.routes.ai import ai_bp
    from app.routes.admin import admin_bp
    from app.routes.providers import providers_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(search_bp, url_prefix="/api")
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(itineraries_bp, url_prefix="/api/itineraries")
    app.register_blueprint(budgets_bp, url_prefix="/api/budgets")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(providers_bp, url_prefix="/api/providers")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "TripPilot AI API"}, 200

    return app
