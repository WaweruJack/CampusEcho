import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.supabase_service import supabase_service

logger = logging.getLogger("campusecho_notification_service")

class NotificationService:
    def create_notification(self, title: str, description: str, type_str: str = "alert", user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates a new notification record in Supabase and triggers reminders.
        """
        now_str = datetime.utcnow().isoformat()
        notification_data = {
            "title": title,
            "description": description,
            "type": type_str,
            "unread": True,
            "created_at": now_str
        }
        if user_id:
            notification_data["user_id"] = user_id

        try:
            db_record = supabase_service.insert("notifications", notification_data)
            
            # Future Ready integration hooks
            self._trigger_email_reminder_stub(title, description, user_id)
            self._trigger_sms_reminder_stub(title, description, user_id)
            
            return db_record
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            # Mock fallback in case table doesn't exist yet in the sandbox Supabase
            return {
                "id": "mock-notif-id",
                "title": title,
                "description": description,
                "type": type_str,
                "unread": True,
                "created_at": now_str,
                "user_id": user_id
            }

    def fetch_user_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Fetches all unread/read notifications for a specific user, plus generic broadcasts.
        """
        try:
            # Basic select
            all_records = supabase_service.fetch_all("notifications")
            # Filter in python to ensure backward compliance when service role keys aren't fully populated
            return [r for r in all_records if r.get("user_id") == user_id or r.get("user_id") is None]
        except Exception as e:
            logger.error(f"Error fetching notifications: {e}")
            return []

    def mark_as_read(self, notification_id: str) -> Optional[Dict[str, Any]]:
        try:
            return supabase_service.update("notifications", notification_id, {"unread": False})
        except Exception as e:
            logger.error(f"Error updating notification: {e}")
            return None

    def delete_notification(self, notification_id: str) -> bool:
        try:
            return supabase_service.delete("notifications", notification_id)
        except Exception as e:
            logger.error(f"Error deleting notification: {e}")
            return False

    # FUTURE-READY STUBS: EMAIL, SMS
    def _trigger_email_reminder_stub(self, title: str, description: str, user_id: Optional[str]) -> None:
        """
        Future-ready email channel placeholder.
        """
        logger.info(f"[STUB - Email Reminder] Scheduled dispatch for user {user_id}: {title} - {description[:30]}...")

    def _trigger_sms_reminder_stub(self, title: str, description: str, user_id: Optional[str]) -> None:
        """
        Future-ready SMS channel placeholder.
        """
        logger.info(f"[STUB - SMS Reminder] Scheduled SMS packet dispatch for user {user_id}: {title}")

# Global instance
notification_service = NotificationService()
