from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class DayOfWeek(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"

class TimetableClassBase(BaseModel):
    unit_code: str = Field(..., alias="unitCode")
    unit_name: str = Field(..., alias="unitName")
    lecturer: str
    venue: str
    time: str  # E.g., "07:00 AM - 10:00 AM", "11:00 AM" etc
    day: DayOfWeek

    class Config:
        populate_by_name = True

class TimetableClassCreate(TimetableClassBase):
    pass

class TimetableClassUpdate(BaseModel):
    unit_code: Optional[str] = Field(None, alias="unitCode")
    unit_name: Optional[str] = Field(None, alias="unitName")
    lecturer: Optional[str] = None
    venue: Optional[str] = None
    time: Optional[str] = None
    day: Optional[DayOfWeek] = None

    class Config:
        populate_by_name = True

class TimetableClassResponse(TimetableClassBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True
        populate_by_name = True
