from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    APP_NAME: str = "CodeLang Academy API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/codelang_academy"
    )

    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60 * 24

    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,https://codelang-academy.vercel.app"
    )

    DOCKER_ENABLED: bool = os.getenv("DOCKER_ENABLED", "false").lower() == "true"
    DOCKER_SANDBOX_IMAGE: str = "codelang-sandbox:latest"
    EXECUTION_TIMEOUT_SECONDS: int = 10
    MAX_CODE_LENGTH: int = 10000

    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
