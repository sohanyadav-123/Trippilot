import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from app import create_app

app = create_app()

# Vercel serverless handler
def handler(request, response):
    """Vercel serverless function entry point."""
    return app(request, response)
