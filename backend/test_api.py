import requests
import json

base_url = "http://localhost:8000/api"

def test_signup():
    payload = {
        "name": "Test User",
        "email": "tester_999@example.com",
        "password": "Pass123!",
        "role": "Student"
    }
    print(f"Testing signup with: {payload}")
    r = requests.post(f"{base_url}/auth/signup", json=payload)
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    return r.json()

def test_me(token):
    print(f"Testing /me with token: {token[:10]}...")
    r = requests.get(f"{base_url}/auth/me", headers={"Authorization": f"Bearer {token}"})
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")

if __name__ == "__main__":
    signup_data = test_signup()
    if signup_data.get("success"):
        token = signup_data["data"]["access_token"]
        test_me(token)
