from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

# MongoDB client initialization
client = AsyncIOMotorClient(settings.MONGODB_URL)

# Database reference
db = client[settings.DATABASE_NAME]

def get_collection(collection_name: str):
    """Get a reference to a specific collection in the database."""
    return db[collection_name]