from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.core.security import get_current_user, require_student, require_lecturer
from app.services.notification_service import notification_service

router = APIRouter(prefix="/notifications", tags=["System Notifications Feed"])

@router.get("", response_model=List[NotificationResponse])
def get_my_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get matching broadcast announcements and unit-specific notifications.
    """
    return notification_service.fetch_user_notifications(current_user["id"])

@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def post_broadcast_notification(req: NotificationCreate, user: Dict[str, Any] = Depends(require_lecturer)):
    """
    Trigger manual dashboard flash broadcasts. Lecturers and admins only.
    """
    return notification_service.create_notification(
        title=req.title,
        description=req.description,
        type_str=req.type,
        user_id=req.user_id
    )

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(notification_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Acknowledge notification read.
    """
    record = notification_service.mark_as_read(notification_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target notification does not exist or has been removed."
        )
    return record

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Wipe alerts.
    """
    success = notification_service.delete_notification(notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found on system notifications databases."
        )
    return None
