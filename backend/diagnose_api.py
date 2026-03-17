import requests
import json

base_url = "http://localhost:8000/api"

def diagnose():
    payload = {
        "name": "Diagnostic User",
        "email": f"diag_{json.dumps(json.loads('{}'))}_test@example.com".replace('"', ''), # ignore this, just want a unique string
        "email": "diag_test_88@example.com",
        "password": "Pass123!",
        "role": "Student"
    }
    
    # Try Signup
    print("--- TESTING SIGNUP ---")
    try:
        r = requests.post(f"{base_url}/auth/signup", json=payload)
        print(f"Status Code: {r.status_code}")
        print(f"Headers: {dict(r.headers)}")
        print(f"Body: {r.text}")
    except Exception as e:
        print(f"Signup failed: {e}")

    # Try Login
    print("\n--- TESTING LOGIN ---")
    login_payload = {"email": "diag_test_88@example.com", "password": "Pass123!"}
    try:
        r = requests.post(f"{base_url}/auth/login", json=login_payload)
        print(f"Status Code: {r.status_code}")
        print(f"Headers: {dict(r.headers)}")
        print(f"Body: {r.text}")
    except Exception as e:
        print(f"Login failed: {e}")

if __name__ == "__main__":
    diagnose()
