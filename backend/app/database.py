from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import BASE_DIR, settings


def _resolve_database_url(database_url: str) -> str:
    if not database_url.startswith("sqlite:///"):
        return database_url

    raw_path = database_url.removeprefix("sqlite:///")
    if raw_path == ":memory:":
        return database_url

    db_path = Path(raw_path)
    if not db_path.is_absolute():
        db_path = (BASE_DIR / db_path).resolve()

    return f"sqlite:///{db_path.as_posix()}"


resolved_database_url = _resolve_database_url(settings.DATABASE_URL)

if resolved_database_url.startswith("sqlite"):
    engine = create_engine(resolved_database_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(resolved_database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
