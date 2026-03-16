import json
import urllib.request
import datetime

url = 'http://127.0.0.1:8001/api/auth/signup'
headers = {'Content-Type': 'application/json'}
payload = {
    'name': 'Test User',
    'email': f'test+{int(datetime.datetime.now().timestamp())}@example.com',
    'password': 'Password123!',
    'confirm_password': 'Password123!',
    'role': 'Student',
}
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')

try:
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read().decode('utf-8'))
    print('RESPONSE:', json.dumps(data, indent=2))
except Exception as e:
    print('ERROR:', e)
    if hasattr(e, 'read'):
        try:
            print(e.read().decode())
        except Exception:
            pass
