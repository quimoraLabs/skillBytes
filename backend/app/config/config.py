import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    MONGODB_URL = os.getenv('MONGODB_URL')
    DATABASE_NAME = os.getenv('DATABASE_NAME')
    JWT_SECRET = os.getenv('JWT_SECRET')

settings = Config()