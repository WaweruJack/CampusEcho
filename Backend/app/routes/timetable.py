from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from app.schemas.timetable import TimetableClassCreate, TimetableClassUpdate, TimetableClassResponse
from app.core.security import get_current_user, require_student, require_lecturer, require_admin
from app.services.timetable_service import timetable_service
from datetime import datetime

router = APIRouter(prefix="/timetable", tags=["Timetables Module"])

@router.get("", response_model=List[TimetableClassResponse])
def get_timetable(day: Optional[str] = None, user: Dict[str, Any] = Depends(require_student)):
    """
    Get all timetable schedules. Accessible to all logged-in students and staff.
    """
    return timetable_service.list_classes(day=day)

@router.get("/today", response_model=List[TimetableClassResponse])
def get_today_timetable(user: Dict[str, Any] = Depends(require_student)):
    """
    Get today's dynamic timetable classes list.
    """
    day_name = datetime.utcnow().strftime("%A").lower()
    return timetable_service.list_classes(day=day_name)

@router.get("/{class_id}", response_model=TimetableClassResponse)
def get_timetable_by_id(class_id: str, user: Dict[str, Any] = Depends(require_student)):
    """
    Get timetable class entry detail.
    """
    entry = timetable_service.fetch_class_by_id(class_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable class entry not found."
        )
    return entry

@router.post("", response_model=TimetableClassResponse, status_code=status.HTTP_201_CREATED)
def create_timetable_class(req: TimetableClassCreate, user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Create a new class entry. Lecturers and admins only.
    """
    class_data = req.model_dump(by_alias=True)
    class_data["lecturer"] = f"{user.get('first_name')} {user.get('last_name')}"
    return timetable_service.create_class(class_data)

@router.put("/{class_id}", response_model=TimetableClassResponse)
def update_timetable_class(class_id: str, req: TimetableClassUpdate, user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Update an existing timetable class. Lecturers and admins only.
    """
    entry = timetable_service.fetch_class_by_id(class_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable class to update was not found."
        )
    
    # Check if this lecturer owns the class or is admin
    if user.get("role") != "admin" and entry.get("lecturer") not in (f"{user.get('first_name')} {user.get('last_name')}", user.get("last_name")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are only authorized to update classes scheduled under your active lectureship."
        )

    updates = {k: v for k, v in req.model_dump(by_alias=True, exclude_unset=True).items() if v is not None}
    updated = timetable_service.update_class(class_id, updates)
    return updated

@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable_class(class_id: str, user: Dict[str, Any] = Depends(require_admin)):
    """
    Delete a class entry from the database dashboard rosters. Admins only.
    """
    success = timetable_service.delete_class(class_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No timetable class matches the requested identifier to remove."
        )
    return None
