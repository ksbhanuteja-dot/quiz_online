import sys
from pathlib import Path

from sqlalchemy import inspect, text

sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from app.database import engine, resolved_database_url


def check_db():
    try:
        print("Database URL:", resolved_database_url)
        if resolved_database_url.startswith("sqlite:///"):
            db_path = Path(resolved_database_url.removeprefix("sqlite:///"))
            print("Database file:", db_path)

        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print("Tables:", tables)

        with engine.connect() as conn:
            for table in tables:
                count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
                print(f"Table {table}: {count} rows")

            users = conn.execute(
                text("SELECT id, name, email, role, is_active FROM users ORDER BY id")
            ).fetchall()
            print("\nUsers:", users)

            quizzes = conn.execute(
                text("SELECT id, title, instructor_id FROM quizzes ORDER BY id")
            ).fetchall()
            print("\nQuizzes:", quizzes)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    check_db()
