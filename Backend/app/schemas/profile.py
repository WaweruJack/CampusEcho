from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserRole

class ProfileBase(BaseModel):
    first_name: str
    last_name: str
    registration_number: Optional[str] = None
    course: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    registration_number: Optional[str] = None
    course: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: str
    email: EmailStr
    role: UserRole
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
Descriptor: Optional[str] = None
