import uuid
from fastapi import status, HTTPException,Header
from datetime import datetime , timezone
from app.config.db import get_collection

async def generate_guest_user():
    users_collection = get_collection("users")
    
    # Geneate a unique guest ID using UUID
    guest_id = f"guest_{uuid.uuid4()}"
    
    # Guest user data
    guest_user = {
        "user_id": guest_id,
        "is_guest": True,
        "created_at": datetime.now(timezone.utc)
    }

    try:
        # Check if the generated guest ID already exists (extremely unlikely)
        existing_user = await users_collection.find_one({"user_id": guest_id})
        if existing_user:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate unique guest ID. Please try again.")

        await users_collection.insert_one(guest_user)

        # 👇 BREAKING FIX: MongoDB ka ObjectId response bhejte waqt JSON compatible nahi hota, isliye delete kar rahe hain
        if "_id" in guest_user:
            del guest_user["_id"]

        return guest_user
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


async def get_current_user(guest_id: str):
    users_collection = get_collection("users")
    user = await users_collection.find_one({"user_id": guest_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # 👇 BREAKING FIX: MongoDB ka ObjectId response bhejte waqt JSON compatible nahi hota, isliye delete kar rahe hain
    if "_id" in user:
        del user["_id"]

    return user

