from app.core.email import send_email

result = send_email('Test Email', 'test@example.com', 'Hello from local SMTP')
print('send_email returned', result)
