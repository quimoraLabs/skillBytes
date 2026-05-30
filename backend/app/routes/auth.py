from fastapi import APIRouter, status
from typing import List
from app.schemas.user_schemas import UserResponse
from app.controller.auth_controller import generate_guest_user, get_current_user , get_all_guest_users


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/guest", status_code=status.HTTP_201_CREATED)
async def create_guest_user():
    """
    Create a guest user with a unique ID and store it in the database. 
    This endpoint returns the guest user details, including the generated unique ID.
    """
    return await generate_guest_user()

@router.get("/guest", response_model=List[UserResponse], status_code=status.HTTP_200_OK)
async def get_all_guests():
    """
    Get the details of all registered guest users.
    """
    return await get_all_guest_users()

@router.get("/guest/{guest_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_guest_user(guest_id: str):
    """
    Get the details of a specific guest user by their unique ID.
    """
    return await get_current_user(guest_id)

