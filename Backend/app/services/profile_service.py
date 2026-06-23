import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.services.supabase_service import supabase_service

logger = logging.getLogger("campusecho_profile_service")

class ProfileService:
    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            return supabase_service.fetch_by_id("profiles", user_id)
        except Exception as e:
            logger.error(f"Error fetching profile by id: {e}")
            return None

    def upsert_profile(self, user_id: str, email: str, role: str, first_name: str, last_name: str, registration_number: Optional[str] = None, course: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates or updates a profile inside our postgres backend.
        """
        now = datetime.utcnow().isoformat()
        profile_data = {
            "id": user_id,
            "email": email,
            "role": role,
            "first_name": first_name,
            "last_name": last_name,
            "registration_number": registration_number,
            "course": course,
            "updated_at": now
        }
        
        try:
            # Check if profile already exists
            existing = self.get_profile(user_id)
            if existing:
                updated = supabase_service.update("profiles", user_id, profile_data)
                return updated if updated else profile_data
            else:
                profile_data["created_at"] = now
                return supabase_service.insert("profiles", profile_data)
        except Exception as e:
            logger.error(f"Error upserting profile: {e}")
            # Mock placeholder to keep app resilient
            profile_data["created_at"] = now
            return profile_data

    def list_all_profiles(self) -> List[Dict[str, Any]]:
        try:
            return supabase_service.fetch_all("profiles")
        except Exception as e:
            logger.error(f"Error retrieving all profiles: {e}")
            return []

    # FUTURE-READY STUB: ANALYTICS
    def record_profile_access_analytics_stub(self, user_id: str, view_action: str) -> None:
        """
        Future-ready analytics tracking stub.
        """
        logger.info(f"[STUB - Analytics] Recording profile action metric for user {user_id}: {view_action}")

# Global service instance
profile_service = ProfileService()
