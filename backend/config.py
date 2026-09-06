import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    MONGO_URI = os.environ.get(
        "MONGO_URI",
        "mongodb://127.0.0.1:27017/trippilot",
    )
    DB_NAME = os.environ.get("DB_NAME", "trippilot")
    GROK_API_KEY = os.environ.get("GROK_API_KEY", "")
    
    # Auto-detect AI provider by key prefix if not explicitly overridden
    if GROK_API_KEY.startswith("gsk_"):
        GROK_BASE_URL = os.environ.get("GROK_BASE_URL", "https://api.groq.com/openai/v1")
        GROK_MODEL = os.environ.get("GROK_MODEL", "openai/gpt-oss-120b")
    elif GROK_API_KEY.startswith("sk-"):
        GROK_BASE_URL = os.environ.get("GROK_BASE_URL", "https://api.openai.com/v1")
        GROK_MODEL = os.environ.get("GROK_MODEL", "gpt-4o-mini")
    else:
        GROK_BASE_URL = os.environ.get("GROK_BASE_URL", "https://api.x.ai/v1")
        GROK_MODEL = os.environ.get("GROK_MODEL", "grok-3-mini")
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    PAYMENT_MODE = os.environ.get("PAYMENT_MODE", "mock")
    CURRENCY = os.environ.get("CURRENCY", "INR")
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 2592000  # 30 days
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}

current_config = config_map.get(os.environ.get("FLASK_ENV", "development"), DevelopmentConfig)
