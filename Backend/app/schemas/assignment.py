from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class AssignmentStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    GRADED = "graded"
    OVERDUE = "overdue"

class AssignmentBase(BaseModel):
    title: str
    unit_code: str = Field(..., alias="unitCode")
    description: Optional[str] = None
    due_date: str = Field(..., alias="dueDate")  # E.g., ISO timestamp or "Jun 24, 2026"
    course_name: Optional[str] = Field(None, alias="courseName")
    status: AssignmentStatus = AssignmentStatus.PENDING

    class Config:
        populate_by_name = True

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    unit_code: Optional[str] = Field(None, alias="unitCode")
    description: Optional[str] = None
    due_date: Optional[str] = Field(None, alias="dueDate")
    course_name: Optional[str] = Field(None, alias="courseName")
    status: Optional[AssignmentStatus] = None

    class Config:
        populate_by_name = True

class AssignmentResponse(AssignmentBase):
    id: str
    lecturer_id: str
    lecturer_name: str
    created_at: str

    class Config:
        from_attributes = True
        populate_by_name = True
