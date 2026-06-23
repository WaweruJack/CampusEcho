from fastapi import APIRouter, Depends, status, HTTPException
from typing import Dict, Any
from app.core.security import require_lecturer
from app.services.notification_service import notification_service
from app.services.timetable_service import timetable_service
from app.services.supabase_service import supabase_service
from datetime import datetime

router = APIRouter(prefix="/lecturers", tags=["Lecturer Portal Controls"])

@router.post("/announcements", status_code=status.HTTP_201_CREATED)
def portal_create_announcement(data: Dict[str, Any], user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Directly posts campus notices from the lecturer dashboard.
    """
    now = datetime.utcnow().isoformat()
    data.update({
        "author": f"{user.get('first_name')} {user.get('last_name')}",
        "author_role": "lecturer",
        "created_at": now
    })
    
    try:
        record = supabase_service.insert("notices", data)
        notification_service.create_notification(
            title="New Announcement Posted",
            description=f"Prof {user.get('last_name')} posted a notice: {data.get('title', '')}"
        )
        return record
    except Exception:
        data["id"] = "mock-notice-id"
        return data

@router.post("/assignments", status_code=status.HTTP_201_CREATED)
def portal_post_assignment(data: Dict[str, Any], user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Direct assignment handout publishes to target classes.
    """
    now = datetime.utcnow().isoformat()
    data.update({
        "lecturer_id": user.get("id"),
        "lecturer_name": f"{user.get('first_name')} {user.get('last_name')}",
        "created_at": now
    })
    
    try:
        record = supabase_service.insert("assignments", data)
        notification_service.create_notification(
            title="Assignment Released",
            description=f"New coursework task assigned for unit {data.get('unitCode')}: '{data.get('title')}'"
        )
        return record
    except Exception:
        data["id"] = "mock-assign-id"
        return data

@router.post("/cat-schedules", status_code=status.HTTP_201_CREATED)
def portal_create_cat_schedule(data: Dict[str, Any], user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Publish Continuous Assessment Test (CAT) calendar reminders.
    """
    unit = data.get("unit", "Core Course")
    venue = data.get("venue", "Main Hall")
    date_str = data.get("date", "Tomorrow")
    time_str = data.get("time", "TBD")
    
    # Broadcast notice
    notif = notification_service.create_notification(
        title="CAT Schedule Released",
        description=f"{unit} Continuous Assessment Test scheduled on {date_str} at {time_str} inside {venue}.",
        type_str="CAT Reminder"
    )
    return {"status": "announced", "notification": notif}

@router.post("/makeup-classes", status_code=status.HTTP_201_CREATED)
def portal_create_makeup_class(data: Dict[str, Any], user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Schedule lecturer makeup lectures and append to student timetables.
    """
    timetable_data = {
        "unitCode": data.get("unitCode"),
        "unitName": data.get("unitName"),
        "lecturer": f"{user.get('first_name')} {user.get('last_name')}",
        "venue": data.get("venue"),
        "time": data.get("time"),
        "day": data.get("day", "monday").lower()
    }
    
    try:
        record = timetable_service.create_class(timetable_data)
        
        notification_service.create_notification(
            title="Makeup Class Scheduled",
            description=f"Attention: A backup class for {data.get('unitCode')} has been scheduled on {data.get('day')} at {data.get('time')} in {data.get('venue')}.",
            type_str="Upcoming Event"
        )
        return record
    except Exception:
        return timetable_data

@router.post("/venue-relocations", status_code=status.HTTP_201_CREATED)
def portal_relocate_venue(data: Dict[str, Any], user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Broadcast venue update alerts for specific classes dynamically.
    """
    unit_code = data.get("unitCode")
    old_venue = data.get("oldVenue")
    new_venue = data.get("newVenue")
    time_val = data.get("time")
    
    notif = notification_service.create_notification(
        title="Course Venue Relocation",
        description=f"Venue Change: {unit_code} class at {time_val} moved from {old_venue} to {new_venue}.",
        type_str="Venue Change"
    )
    return {"status": "broadcasted", "notification": notif}
