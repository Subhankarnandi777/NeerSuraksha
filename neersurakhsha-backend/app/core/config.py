from typing import Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "NeerSurakhsha API"
    API_V1_STR: str = "/api/v1"
    
    DEBUG: bool = False
    
    # DATABASE
    DATABASE_URL: str = "sqlite:///./neersurakhsha.db"
    
    # SECURITY
    SECRET_KEY: Optional[str] = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8081"]
    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_mode(cls, value):
        """Accept deployment labels such as DEBUG=release without failing boot."""
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on", "debug", "development"}
        return value
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.DEBUG and (not self.SECRET_KEY or self.SECRET_KEY == "change-me"):
            raise ValueError("SECRET_KEY must be set in non-debug mode.")
        if self.DEBUG and not self.SECRET_KEY:
            self.SECRET_KEY = "super-secret-key-change-me"

settings = Settings()
