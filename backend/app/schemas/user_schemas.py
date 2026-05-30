from pydantic import BaseModel, Field
from datetime import datetime

# 0. USER / AUTH SCHEMAS

class UserResponse(BaseModel):
    user_id: str = Field(..., example="guest_a1b2c3d4...")
    is_guest: bool = Field(default=True)
    created_at: datetime

    class Config:
        from_attributes = True