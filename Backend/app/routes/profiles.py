from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.core.security import get_current_user, require_admin
from app.services.profile_service import profile_service

router = APIRouter(prefix="/profiles", tags=["User Profiles"])

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get the profile details of the currently authenticated student/lecturer.
    """
    profile = profile_service.get_profile(current_user["id"])
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile data not found on server databases."
        )
    return profile

@router.put("/me", response_model=ProfileResponse)
def update_my_profile(update_data: ProfileUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Update personal profile information.
    """
    profile = profile_service.get_profile(current_user["id"])
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile data to update was not found."
        )
    
    # Prune null updates
    updates = {k: v for k, v in update_data.model_dump(exclude_unset=True).items() if v is not None}
    
    updated_profile = profile_service.upsert_profile(
        user_id=current_user["id"],
        email=current_user["email"],
        role=current_user["role"],
        first_name=updates.get("first_name", profile.get("first_name")),
        last_name=updates.get("last_name", profile.get("last_name")),
        registration_number=updates.get("registration_number", profile.get("registration_number")),
        course=updates.get("course", profile.get("course"))
    )
    return updated_profile

@router.get("/{profile_id}", response_model=ProfileResponse)
def get_any_profile(profile_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Access any profile on campus files (e.g., student checking lecturing professor details).
    """
    profile = profile_service.get_profile(profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with identifier '{profile_id}' could not be resolved."
        )
    return profile

@router.get("", response_model=List[ProfileResponse])
def list_all_campus_profiles(_: Dict[str, Any] = Depends(require_admin)):
    """
    List all active student / lecturer files. Admin only.
    """
    return profile_service.list_all_profiles()
