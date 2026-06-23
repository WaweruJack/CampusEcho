from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NoticeBase(BaseModel):
    title: str
    content: str
    category: str = "General"  # General, Academic, Sports, Administrative, etc.
    archived: bool = False

class NoticeCreate(NoticeBase):
    pass

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    archived: Optional[bool] = None

class NoticeResponse(NoticeBase):
    id: str
    author_name: str = Field(..., alias="author")
    author_role: str = "lecturer"
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True
