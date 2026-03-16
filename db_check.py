import sqlite3

def check_db():
    try:
        conn = sqlite3.connect('backend/quiz.db')
        cursor = conn.cursor()
        
        tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
        print("Tables:", [t[0] for t in tables])
        
        for table in [t[0] for t in tables]:
            count = cursor.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
            print(f"Table {table}: {count} rows")
            
        # Check users
        users = cursor.execute("SELECT id, name, email, role, is_active FROM users").fetchall()
        print("\nUsers:", users)
        
        # Check quizzes
        quizzes = cursor.execute("SELECT id, title, instructor_id FROM quizzes").fetchall()
        print("\nQuizzes:", quizzes)
        
        conn.close()
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    check_db()
