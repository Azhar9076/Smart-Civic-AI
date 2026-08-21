from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = 'postgresql://civic_admin:civic_secure_2026@postgres:5432/smart_civic'
    REDIS_URL: str = 'redis://redis:6379/0'
    APP_NAME: str = 'Smart Civic AI'
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ['http://localhost:3000']
    SLA_DEFAULT_HOURS: int = 48
    DEDUP_RADIUS_METERS: int = 15
    DEDUP_TIME_WINDOW_HOURS: int = 72
    PRIORITY_WEIGHTS: dict = {
        "severity": 0.35,
        "safety_risk": 0.25,
        "location_risk": 0.20,
        "upvotes": 0.10,
        "age": 0.10
    }

    class Config:
        env_file = ".env"

_settings = Settings()

def get_settings() -> Settings:
    return _settings
