from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from app.core.security import require_student, require_lecturer, require_admin
from app.services.supabase_service import supabase_service
from app.services.notification_service import notification_service
from datetime import datetime

router = APIRouter(prefix="/assignments", tags=["Assignments Module"])

@router.get("", response_model=List[AssignmentResponse])
def get_assignments(status_filter: Optional[str] = None, user: Dict[str, Any] = Depends(require_student)):
    """
    Get course assignments list. Enables filters such as pending and overdue.
    """
    try:
        assignments = supabase_service.fetch_all("assignments")
        if status_filter:
            return [a for a in assignments if a.get("status", "").lower() == status_filter.lower()]
        return assignments
    except Exception:
        return []

@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment_by_id(assignment_id: str, user: Dict[str, Any] = Depends(require_student)):
    """
    Lookup full task sheets for assigned courses.
    """
    assignment = supabase_service.fetch_by_id("assignments", assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment worksheet not found."
        )
    return assignment

@router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(req: AssignmentCreate, user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Release a new course assignment for students. Auto-broadcasts system notifications.
    """
    now = datetime.utcnow().isoformat()
    assignment_data = req.model_dump(by_alias=True)
    assignment_data["lecturer_id"] = user.get("id")
    assignment_data["lecturer_name"] = f"{user.get('first_name')} {user.get('last_name')}"
    assignment_data["created_at"] = now
    
    try:
        record = supabase_service.insert("assignments", assignment_data)
        
        # Automatic alert broadcast to students via core notification engine
        notification_service.create_notification(
            title="New Assignment Released",
            description=f"New assignment for unit {req.unit_code}: '{req.title}' has been published. Due on {req.due_date}.",
            type_str="Assignment Due"
        )
        return record
    except Exception:
        assignment_data["id"] = "mock-assignment-id"
        return assignment_data

@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(assignment_id: str, req: AssignmentUpdate, user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Lecturer modifies status or deadlines.
    """
    assignment = supabase_service.fetch_by_id("assignments", assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment target does not exist."
        )
    
    # Ownership authorization check
    if user.get("role") != "admin" and assignment.get("lecturer_id") != user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You may only alter assignments where you hold sole lectureship ownership."
        )

    updates = {k: v for k, v in req.model_dump(by_alias=True, exclude_unset=True).items() if v is not None}
    return supabase_service.update("assignments", assignment_id, updates)

@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(assignment_id: str, user: Dict[str, Any] = Depends(require_admin)):
    """
    Remove assignment listing from student dashboards. Standard admin control permission.
    """
    success = supabase_service.delete("assignments", assignment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No assignment matches target index."
        )
    return None
