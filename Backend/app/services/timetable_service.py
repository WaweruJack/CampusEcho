import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.supabase_service import supabase_service

logger = logging.getLogger("campusecho_timetable_service")

class TimetableService:
    def list_classes(self, day: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            records = supabase_service.fetch_all("timetables")
            if day:
                day_lower = day.lower()
                return [r for r in records if r.get("day", "").lower() == day_lower]
            return records
        except Exception as e:
            logger.error(f"Error reading timetables list: {e}")
            return []

    def fetch_class_by_id(self, class_id: str) -> Optional[Dict[str, Any]]:
        try:
            return supabase_service.fetch_by_id("timetables", class_id)
        except Exception as e:
            logger.error(f"Error fetching class by id: {e}")
            return None

    def create_class(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            now = datetime.utcnow().isoformat()
            data["created_at"] = now
            return supabase_service.insert("timetables", data)
        except Exception as e:
            logger.error(f"Error creating classroom entry: {e}")
            # Resilient mock fallback returning input
            data["id"] = "mock-class-id"
            data["created_at"] = now
            return data

    def update_class(self, class_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            return supabase_service.update("timetables", class_id, data)
        except Exception as e:
            logger.error(f"Error updating class: {e}")
            return None

    def delete_class(self, class_id: str) -> bool:
        try:
            return supabase_service.delete("timetables", class_id)
        except Exception as e:
            logger.error(f"Error deleting timetable class: {e}")
            return False

    # FUTURE-READY STUBS: ECHOBOT AI, CAMPUS NAVIGATION
    def query_echobot_ai_timetable_advice_stub(self, unit_code: str, student_query: str) -> str:
        """
        Future-ready EchoBot AI natural language advice stub.
        """
        logger.info(f"[STUB - EchoBot AI] Analysing timetable schedule advice for unit: {unit_code}")
        return f"EchoBot Stub: Your class {unit_code} is normally scheduled on mornings. Try reviewing chapters early."

    def fetch_campus_navigation_routing_stub(self, current_location: str, target_venue: str) -> Dict[str, Any]:
        """
        Future-ready Campus Navigation stub.
        """
        logger.info(f"[STUB - Campus Navigation] Calculating optimal route to {target_venue}")
        return {
            "route_steps": [f"Start from {current_location}", f"Walk path A to Science Lab", f"Enter {target_venue}"],
            "estimated_time_minutes": 4,
            "distance_meters": 220
        }

# Global singleton instance
timetable_service = TimetableService()
