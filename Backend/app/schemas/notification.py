from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class NotificationType(str, Enum):
    ASSIGNMENT_DUE = "Assignment Due"
    CAT_REMINDER = "CAT Reminder"
    VENUE_CHANGE = "Venue Change"
    NEW_ANNOUNCEMENT = "New Announcement"
    UPCOMING_EVENT = "Upcoming Event"
    ALERT = "alert"

class NotificationBase(BaseModel):
    title: str
    description: str
    type: str = "alert" # NotificationType or generic alert
    unread: bool = True

class NotificationCreate(NotificationBase):
    user_id: Optional[str] = None  # To target a specific user, or None for broadcast

class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    unread: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: str
    user_id: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True
