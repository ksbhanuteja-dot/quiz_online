from typing import Optional

from pathlib import Path
from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parents[3]
BASE_DIR = PROJECT_ROOT / "backend"

backend_env = BASE_DIR / ".env"
project_env = PROJECT_ROOT / ".env"

if backend_env.exists():
    load_dotenv(backend_env)

if project_env.exists():
    load_dotenv(project_env, override=True)


class Settings(BaseSettings):
    DATABASE_URL: Optional[str] = None
    MYSQL_URL: Optional[str] = None
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    FRONTEND_URL: str = "http://localhost:5173"
    DEBUG: bool = True

    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = "no-reply@quizonline.local"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "production"}:
                return False
        return bool(value)

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def resolve_database_url(cls, value, info):
        database_url = value or info.data.get("MYSQL_URL")
        if not database_url:
            raise ValueError("DATABASE_URL or MYSQL_URL must be provided")

        if database_url.startswith("mysql://"):
            return "mysql+pymysql://" + database_url.removeprefix("mysql://")

        return database_url


settings = Settings()
