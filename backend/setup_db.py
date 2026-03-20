from pathlib import Path

from app import models  # noqa: F401
from app.database import Base, engine, resolved_database_url


def main():
    Base.metadata.create_all(bind=engine)

    print("Database setup complete.")
    print(f"Database URL: {resolved_database_url}")

    if resolved_database_url.startswith("sqlite:///"):
        db_path = Path(resolved_database_url.removeprefix("sqlite:///"))
        print(f"SQLite file: {db_path}")
        print(f"Exists: {db_path.exists()}")


if __name__ == "__main__":
    main()
