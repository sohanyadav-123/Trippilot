import logging
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
from config import current_config
import certifi

logger = logging.getLogger(__name__)

_client = None
_db = None
_is_connected = False


class InMemoryCollection:
    """In-memory mock collection for local development resilience when MongoDB Atlas is unreachable."""
    def __init__(self, name):
        self.name = name
        self._data = []

    def find(self, query=None):
        return MockCursor(self._data)

    def find_one(self, query=None):
        return None

    def insert_one(self, doc):
        if "_id" not in doc:
            from bson import ObjectId
            doc["_id"] = ObjectId()
        self._data.append(doc)
        return type("InsertResult", (), {"inserted_id": doc["_id"]})()

    def update_one(self, query, update, upsert=False):
        return type("UpdateResult", (), {"matched_count": 1, "modified_count": 1})()

    def count_documents(self, query=None):
        return len(self._data)

    def create_index(self, *args, **kwargs):
        pass


class MockCursor:
    def __init__(self, data):
        self._data = list(data)

    def sort(self, *args, **kwargs):
        return self

    def skip(self, count):
        self._data = self._data[count:]
        return self

    def limit(self, count):
        self._data = self._data[:count]
        return self

    def __iter__(self):
        return iter(self._data)

    def __len__(self):
        return len(self._data)


class MockDatabase:
    def __init__(self):
        self._collections = {}

    def __getattr__(self, name):
        if name not in self._collections:
            self._collections[name] = InMemoryCollection(name)
        return self._collections[name]

    def __getitem__(self, name):
        return self.__getattr__(name)


_mock_db = MockDatabase()


def get_db():
    global _client, _db, _is_connected
    if _db is not None and _is_connected:
        return _db

    try:
        kwargs = {
            "serverSelectionTimeoutMS": 3000,
            "connectTimeoutMS": 3000,
        }
        # Only attach tlsCAFile if connecting to MongoDB Atlas / TLS-enabled cluster
        uri = current_config.MONGO_URI
        if "mongodb+srv" in uri or "ssl=true" in uri.lower() or "tls=true" in uri.lower():
            kwargs["tlsCAFile"] = certifi.where()

        _client = MongoClient(uri, **kwargs)
        # Test connection ping
        _client.admin.command('ping')
        db_name = current_config.DB_NAME or "trippilot"
        _db = _client[db_name]
        _is_connected = True
        logger.info(f"Connected successfully to MongoDB database: {db_name}")
        try:
            _create_indexes(_db)
        except Exception as idx_err:
            logger.warning(f"Index creation warning: {idx_err}")
        return _db
    except Exception as e:
        logger.warning(f"MongoDB connection failed ({e}). Falling back to resilient in-memory development store.")
        _is_connected = False
        return _mock_db


def _create_indexes(db):
    try:
        db.users.create_index("email", unique=True)
        db.users.create_index("role")
        db.destinations.create_index([("country", ASCENDING), ("city", ASCENDING)])
        db.flights.create_index([("origin", ASCENDING), ("destination", ASCENDING)])
        db.hotels.create_index([("country", ASCENDING), ("city", ASCENDING)])
        db.bookings.create_index("booking_reference", unique=True)
    except Exception as e:
        logger.warning(f"Index initialization note: {e}")
