import sys
import os

# Add backend directory to Python path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Load environment variables if present locally
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_path, '.env'))

from app import create_app

# Vercel natively invokes WSGI 'app'
app = create_app()
