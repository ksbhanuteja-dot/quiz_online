import urllib.request

# Replace with token from the last signup response (or from email link)
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0KzE3NzM2NTQ1MDBAZXhhbXBsZS5jb20iLCJyb2xlIjoiU3R1ZGVudCIsImV4cCI6MTc3Mzc0MDkwMSwidHlwZSI6ImVtYWlsX3ZlcmlmaWNhdGlvbiJ9.aibU4V3lF86dmKL-xW9TFc3I23JN07AOmkzCUZ7iwAw'
url = f'http://127.0.0.1:8001/api/auth/verify-email?token={token}'
req = urllib.request.Request(url)
with urllib.request.urlopen(req, timeout=10) as resp:
    print('VERIFY RESPONSE:', resp.read().decode())
