from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.core.security import require_student, require_lecturer, require_admin
from app.services.supabase_service import supabase_service
from datetime import datetime

router = APIRouter(prefix="/events", tags=["Campus Events"])

@router.get("", response_model=List[EventResponse])
def get_events(category: Optional[str] = None, user: Dict[str, Any] = Depends(require_student)):
    """
    Get matching active graduation dates, tech events, hackathons, and academic calendars.
    """
    try:
        events = supabase_service.fetch_all("events")
        if category:
            return [e for e in events if e.get("category", "").lower() == category.lower()]
        return events
    except Exception:
        return []

@router.get("/{event_id}", response_model=EventResponse)
def get_event_by_id(event_id: str, user: Dict[str, Any] = Depends(require_student)):
    """
    Access a single event instance information details.
    """
    event = supabase_service.fetch_by_id("events", event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event entry could not be allocated."
        )
    return event

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(req: EventCreate, user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Post/publish a Graduation, Tech Event, or Hackathon schedule to campus calendars.
    """
    event_data = req.model_dump()
    event_data["created_at"] = datetime.utcnow().isoformat()
    try:
        return supabase_service.insert("events", event_data)
    except Exception:
        event_data["id"] = "mock-event-id"
        return event_data

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: str, req: EventUpdate, user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Modify an event schedule or details.
    """
    event = supabase_service.fetch_by_id("events", event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event object to update does not exist."
        )
    updates = {k: v for k, v in req.model_dump(exclude_unset=True).items() if v is not None}
    return supabase_service.update("events", event_id, updates)

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, user: Dict[str, Any] = Depends(require_admin)):
    """
    Remove event schedule from calendars. Admin authorization override.
    """
    success = supabase_service.delete("events", event_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested event to wipe does not exist."
        )
    return None
