import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8000/api"

def make_request(method, url, data=None, headers=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        return e.code, err_msg
    except Exception as e:
        return 500, str(e)

def test_flow():
    print("Testing Signup...")
    status, res = make_request("POST", f"{BASE_URL}/auth/signup", data={
        "name": "Test Instructor",
        "email": "instructor@test.com",
        "password": "password123",
        "role": "Instructor"
    })
    if status not in (200, 201):
        if "already exists" not in str(res):
            print("Instructor Signup Failed:", res)
            return

    print("Testing Instructor Login...")
    status, res = make_request("POST", f"{BASE_URL}/auth/login", data={
        "email": "instructor@test.com",
        "password": "password123"
    })
    if status != 200:
        print("Instructor Login Failed:", res)
        return
    token = res["token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("Testing Quiz Creation...")
    quiz_data = {
        "title": "Test Quiz",
        "timer": 10,
        "questions": [
            {
                "question_text": "What is 2+2?",
                "options": [
                    {"option_text": "3", "is_correct": False},
                    {"option_text": "4", "is_correct": True}
                ]
            }
        ]
    }
    status, res = make_request("POST", f"{BASE_URL}/instructor/quizzes", data=quiz_data, headers=headers)
    if status != 200:
        print("Create Quiz Failed:", res)
        return
    quiz_id = res["id"]

    print("Testing Student flow...")
    status, res = make_request("POST", f"{BASE_URL}/auth/signup", data={
        "name": "Test Student",
        "email": "student@test.com",
        "password": "password123",
        "role": "Student"
    })
    status, res = make_request("POST", f"{BASE_URL}/auth/login", data={
        "email": "student@test.com",
        "password": "password123"
    })
    s_token = res["token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}

    print("Testing Get Available Quizzes...")
    status, res = make_request("GET", f"{BASE_URL}/student/available-quizzes", headers=s_headers)
    if status != 200:
        print("Get Quizzes Failed:", res)
        return

    print("Testing Quiz Submit...")
    # get specific quiz
    status, res = make_request("GET", f"{BASE_URL}/student/quizzes/{quiz_id}", headers=s_headers)
    if status != 200:
        print("Get Quiz Failed:", res)
        return
    
    q_id = res["questions"][0]["id"]
    
    status, res = make_request("POST", f"{BASE_URL}/student/quizzes/{quiz_id}/submit", data={"answers": {str(q_id): 1}}, headers=s_headers)
    if status != 200:
        print("Submit Quiz Failed:", res)
        return

    print("All tests passed! API Flow is perfect.")

if __name__ == "__main__":
    test_flow()
