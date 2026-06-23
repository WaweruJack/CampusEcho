import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "CampusEcho V1 Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # Supabase Credentials
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Security Setup
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 Hours
    
    # Dev settings / fallbacks
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings
try:
    settings = Settings()
except Exception:
    # Fallback to direct OS env reading for environment independence
    class FallbackSettings:
        APP_NAME = os.getenv("APP_NAME", "CampusEcho V1 Backend")
        APP_ENV = os.getenv("APP_ENV", "development")
        DEBUG = os.getenv("DEBUG", "True").lower() == "true"
        SUPABASE_URL = os.getenv("SUPABASE_URL", "")
        SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
        SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_campusecho_jwt_secret_key_64_bits_unique_key")
        JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    settings = FallbackSettings() # type: ignore
