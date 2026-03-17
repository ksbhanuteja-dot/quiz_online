import requests
import uuid

BASE_URL = "http://localhost:8000/api"

def run_diag():
    unique = uuid.uuid4().hex[:6]
    email = f"diag_{unique}@test.com"
    print(f"Testing with unique email: {email}")
    
    s = requests.Session()
    
    # 1. Signup
    signup_resp = s.post(f"{BASE_URL}/auth/signup", json={
        "name": "Diag Student",
        "email": email,
        "password": "Pass123!",
        "role": "Student"
    })
    print(f"Signup: {signup_resp.status_code}")
    if signup_resp.status_code != 201:
        print(f"Signup Failed: {signup_resp.text}")
        return

    token = signup_resp.json().get('token') or signup_resp.json().get('access_token')
    if not token:
        print("No token received")
        return
        
    s.headers.update({"Authorization": f"Bearer {token}"})
    
    # 2. List Quizzes
    list_resp = s.get(f"{BASE_URL}/student/quizzes/")
    print(f"List Quizzes: {list_resp.status_code}")
    if list_resp.status_code != 200:
        print(f"List Failed: {list_resp.text}")
        return
        
    quizzes = list_resp.json().get('data', [])
    print(f"Found {len(quizzes)} quizzes")
    
    if not quizzes:
        print("No quizzes available to test start/submit.")
        return
        
    qid = quizzes[0]['id']
    print(f"Attempting to start quiz ID: {qid}")
    
    # 3. Start
    start_resp = s.post(f"{BASE_URL}/student/quizzes/{qid}/start")
    print(f"Start Quiz {qid}: {start_resp.status_code}")
    print(f"Start Response: {start_resp.text}")
    
    # 4. Submit
    submit_resp = s.post(f"{BASE_URL}/student/quizzes/{qid}/submit", json={
        "answers": []
    })
    print(f"Submit Quiz {qid}: {submit_resp.status_code}")
    print(f"Submit Response: {submit_resp.text}")

if __name__ == "__main__":
    run_diag()
