import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables from .env file
load_dotenv()

class Config:
    MONGODB_URL = os.getenv('MONGODB_URL')
    DATABASE_NAME = os.getenv('DATABASE_NAME')
    JWT_SECRET = os.getenv('JWT_SECRET')

settings = Config()

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

def get_collection(collection_name: str):
    """
    Helper function to get a MongoDB collection instance.
    Usage:
    """
    return db[collection_name]