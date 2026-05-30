import uuid
from fastapi import status, HTTPException
from datetime import datetime, timezone
from app.config.db import get_collection

async def generate_guest_user() -> dict:
    """
    Generates a unique guest user identifier, stores the guest 
    profile in MongoDB, and returns the created user document.
    """
    users_collection = get_collection("users")
    
    # Generate a unique guest ID using UUID
    guest_id = f"guest_{uuid.uuid4()}"
    
    # Structure the guest user document
    guest_user = {
        "user_id": guest_id,
        "is_guest": True,
        "created_at": datetime.now(timezone.utc)
    }

    try:
        # Check if the generated guest ID already exists
        existing_user = await users_collection.find_one({"user_id": guest_id})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Failed to generate unique guest ID. Please try again."
            )

        await users_collection.insert_one(guest_user)

        # BREAKING FIX: MongoDB's ObjectId is not JSON serializable, removing it before response conversion
        if "_id" in guest_user:
            del guest_user["_id"]

        return guest_user
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


async def get_current_user(guest_id: str) -> dict:
    """
    Retrieves a specific guest user from the database by their unique user_id.
    """
    users_collection = get_collection("users")
    user = await users_collection.find_one({"user_id": guest_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # BREAKING FIX: MongoDB's ObjectId is not JSON serializable, removing it before response conversion
    if "_id" in user:
        del user["_id"]

    return user

async def get_all_guest_users() -> list:
    """
    Fetches all registered guest users from the database.
    """
    users_collection = get_collection("users")
    guest_users = []
    
    async for user in users_collection.find({"is_guest": True}):
        # BREAKING FIX: MongoDB's ObjectId is not JSON serializable, removing it before response conversion
        if "_id" in user:
            del user["_id"]
        guest_users.append(user)
        
    return guest_users