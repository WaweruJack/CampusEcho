from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    LECTURER = "lecturer"
    ADMIN = "admin"

class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="Email domain must match @students.must.ac.ke or @must.ac.ke")
    password: str = Field(..., min_length=6, description="Minimum 6 character strong password")
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    registration_number: Optional[str] = Field(None, description="E.g., CT201/0001/22 for students, leave empty for lecturers")
    course: Optional[str] = Field(None, description="Course name for students, department name for lecturers")

    @field_validator('email')
    @classmethod
    def validate_edu_email(cls, v: str) -> str:
        email_lower = v.lower()
        if not (email_lower.endswith("@students.must.ac.ke") or email_lower.endswith("@must.ac.ke")):
            raise ValueError("Only @students.must.ac.ke (students) or @must.ac.ke (lecturers) emails represent valid MUST domains.")
        return email_lower

class LoginRequest(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)
