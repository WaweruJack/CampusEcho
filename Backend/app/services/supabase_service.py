import logging
from typing import Dict, Any, List, Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("campusecho_service")

class SupabaseService:
    def __init__(self) -> None:
        self.client: Optional[Client] = None
        self._initialize_client()

    def _initialize_client(self) -> None:
        try:
            if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                logger.info("Supabase client successfully initialized.")
            else:
                logger.warning("SUPABASE_URL and SUPABASE_ANON_KEY are missing in configurations.")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase connection: {e}", exc_info=True)

    def get_client(self) -> Client:
        if not self.client:
            # Re-attempt initialization
            self._initialize_client()
            if not self.client:
                raise RuntimeError("Supabase client is not initialized. Check your credentials in .env.")
        return self.client

    # Simple CRUD helper adapters to simplify table interactions
    def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        client = self.get_client()
        response = client.table(table).insert(data).execute()
        if len(response.data) > 0:
            return response.data[0]
        return {}

    def fetch_all(self, table: str, query_builders: Optional[List[Any]] = None) -> List[Dict[str, Any]]:
        client = self.get_client()
        query = client.table(table).select("*")
        # Apply filters if queried (basic list output)
        response = query.execute()
        return response.data

    def fetch_by_id(self, table: str, record_id: str) -> Optional[Dict[str, Any]]:
        client = self.get_client()
        response = client.table(table).select("*").eq("id", record_id).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None

    def update(self, table: str, record_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        client = self.get_client()
        response = client.table(table).update(data).eq("id", record_id).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None

    def delete(self, table: str, record_id: str) -> bool:
        client = self.get_client()
        response = client.table(table).delete().eq("id", record_id).execute()
        return len(response.data) > 0

# Single global instance for reuse
supabase_service = SupabaseService()
