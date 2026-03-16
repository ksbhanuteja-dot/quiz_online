import smtplib
from app.core.config import settings

print('SMTP settings:', settings.SMTP_HOST, settings.SMTP_PORT, settings.SMTP_USER)

try:
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
        smtp.set_debuglevel(1)
        smtp.ehlo()
        if smtp.has_extn('starttls'):
            smtp.starttls()
            smtp.ehlo()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        smtp.quit()
        print('Connected and authenticated successfully')
except Exception as e:
    print('SMTP connection failed:', e)
