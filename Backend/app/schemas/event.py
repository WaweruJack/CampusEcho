from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class EventCategory(str, Enum):
    GRADUATION = "Graduation"
    TECH_EVENT = "Tech Event"
    HACKATHON = "Hackathon"
    ACADEMIC_DEADLINE = "Academic Deadline"
    CAMPUS_ACTIVITY = "Campus Activity"

class EventBase(BaseModel):
    title: str
    description: str
    category: EventCategory
    date: str  # E.g., "YYYY-MM-DD" or "Jun 24, 2026"
    venue: str

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[EventCategory] = None
    date: Optional[str] = None
    venue: Optional[str] = None

class EventResponse(EventBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True
