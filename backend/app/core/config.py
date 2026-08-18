import os
from pydantic_settings import BaseSettings

# Use relative path so it works on both local Windows and Render Linux
DEFAULT_DB_PATH = "sqlite:///./careersync.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerSync"
    DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_DB_PATH)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-in-production-123456")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")  # Do not hardcode API keys to prevent secret leaks

    class Config:
        case_sensitive = True

settings = Settings()
