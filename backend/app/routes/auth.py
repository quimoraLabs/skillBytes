from fastapi import APIRouter, status
from app.controller.auth_controller import generate_guest_user, get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/guest", status_code=status.HTTP_201_CREATED)
async def create_guest_user():
    """
    create a guest user with a unique ID and store it in the database. This endpoint will return the guest user details, including the generated unique ID.
    """
    return await generate_guest_user()

@router.get("/guest/{guest_id}", status_code=status.HTTP_200_OK)
async def get_guest_user(guest_id: str):
    """
    Get the details of a specific guest user by their ID.
    """
    return await get_current_user(guest_id)