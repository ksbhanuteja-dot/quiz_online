from pathlib import Path
import sqlite3
import sys

from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import models  # noqa: F401
from app.database import Base, engine, resolved_database_url


SQLITE_SOURCE = Path(__file__).resolve().parent / "quiz.db"
TABLE_ORDER = [
    "users",
    "quizzes",
    "questions",
    "attempts",
    "options",
    "student_answers",
]


def read_sqlite_rows(table_name: str):
    with sqlite3.connect(SQLITE_SOURCE) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(f"SELECT * FROM {table_name}").fetchall()
        return [dict(row) for row in rows]


def main():
    if not resolved_database_url.startswith("mysql+pymysql://"):
        raise RuntimeError(f"Expected a MySQL database URL, got: {resolved_database_url}")

    if not SQLITE_SOURCE.exists():
        raise FileNotFoundError(f"SQLite source not found: {SQLITE_SOURCE}")

    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        for table_name in reversed(TABLE_ORDER):
            conn.execute(text(f"DELETE FROM {table_name}"))

        for table_name in TABLE_ORDER:
            rows = read_sqlite_rows(table_name)
            if not rows:
                continue
            table = Base.metadata.tables[table_name]
            conn.execute(table.insert(), rows)
            print(f"Migrated {len(rows)} row(s) into {table_name}")

        conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

    print("Migration complete.")
    print(f"MySQL URL: {resolved_database_url}")
    print(f"SQLite source: {SQLITE_SOURCE}")


if __name__ == "__main__":
    main()
