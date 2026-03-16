import smtplib
from email.message import EmailMessage
from app.core.config import settings


def send_email(subject: str, recipient: str, body: str) -> bool:
    """Send an email. Returns True if sent or simulated."""
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.EMAIL_FROM or "no-reply@quizonline.local"
    message["To"] = recipient
    message.set_content(body)

    if not settings.SMTP_HOST or not settings.SMTP_PORT:
        # Fallback: print to console so devs can copy/paste link
        print("[EMAIL] SMTP settings not configured. Falling back to console output.")
        print("To:", recipient)
        print("Subject:", subject)
        print(body)
        return True

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            smtp.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)
        return True
    except Exception as e:
        # Log and continue (don't block signup)
        print(f"[EMAIL] Failed to send email: {e}")
        print("[EMAIL] Fallback content:")
        print(body)
        return False
