from sqlalchemy import create_engine, text
import sys

# Connection string from the .env file
DATABASE_URL = "postgresql://postgres:Bhanu%401234@localhost:5432/quiz_db"

def check_db():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT 5"))
            users = result.fetchall()
            
            if not users:
                print("No users found in the 'users' table.")
                return

            print("--- RECENT USERS ---")
            for user in users:
                print(f"ID: {user[0]} | Name: {user[1]} | Email: {user[2]} | Role: {user[3]} | Created: {user[4]}")
            
    except Exception as e:
        print(f"ERROR connecting to DB: {e}")

if __name__ == "__main__":
    check_db()
