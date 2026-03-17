import requests
import json
import uuid

base_url = "http://localhost:8000/api"

def diagnose():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Diagnostic User",
        "email": unique_email,
        "password": "Pass123!",
        "role": "Student"
    }
    
    # Try Signup
    print(f"--- TESTING SIGNUP ({unique_email}) ---")
    try:
        r = requests.post(f"{base_url}/auth/signup", json=payload)
        print(f"Status Code: {r.status_code}")
        print(f"Body: {r.text}")
    except Exception as e:
        print(f"Signup failed: {e}")

    # Try Login
    print("\n--- TESTING LOGIN ---")
    login_payload = {"email": unique_email, "password": "Pass123!"}
    try:
        r = requests.post(f"{base_url}/auth/login", json=login_payload)
        print(f"Status Code: {r.status_code}")
        print(f"Body: {r.text}")
    except Exception as e:
        print(f"Login failed: {e}")

if __name__ == "__main__":
    diagnose()
