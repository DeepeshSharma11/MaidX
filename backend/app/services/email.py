"""
Email service: Resend primary → Google SMTP fallback.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import resend

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

resend.api_key = settings.RESEND_API_KEY


def _send_via_resend(to: str, subject: str, html: str) -> bool:
    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        return True
    except Exception as e:
        logger.warning(f"Resend failed: {e}")
        return False


def _send_via_smtp(to: str, subject: str, html: str) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.SMTP_FROM_EMAIL, to, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"SMTP fallback failed: {e}")
        return False


def send_email(to: str, subject: str, html: str) -> bool:
    """Try Resend first, fall back to SMTP, then console log for dev."""
    if _send_via_resend(to, subject, html):
        return True
    if _send_via_smtp(to, subject, html):
        return True
    # Dev fallback: extract OTP from HTML and log it
    import re
    otp_match = re.search(r'\b\d{6}\b', html)
    if otp_match:
        logger.warning(f"⚠️  EMAIL FAILED — DEV MODE OTP for {to}: {otp_match.group()}")
    return False


# ── Email Templates ──────────────────────────────────────

def send_welcome_email(to: str, name: str, confirm_url: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#4f46e5">Welcome to MaidX, {name}! 🎉</h2>
      <p>Tap below to verify your email and activate your account:</p>
      <a href="{confirm_url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        Verify Email
      </a>
      <p style="color:#6b7280;font-size:12px;margin-top:24px">
        If you didn't create this account, ignore this email.
      </p>
    </div>
    """
    return send_email(to, "Verify your MaidX account", html)


def send_otp_email(to: str, otp: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#4f46e5">Your MaidX OTP</h2>
      <p>Use the code below to verify your action. Expires in 10 minutes.</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e1b4b;padding:16px 0">{otp}</div>
      <p style="color:#6b7280;font-size:12px">If you didn't request this, please ignore.</p>
    </div>
    """
    return send_email(to, "Your MaidX verification code", html)
