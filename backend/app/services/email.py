"""
Email service: Resend primary → Gmail SMTP SSL (port 465) fallback.
Note: Port 587 (STARTTLS) is blocked on Render free tier.
      Port 465 (SSL) works on most cloud providers.
"""
import logging
import re
import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import resend
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

resend.api_key = settings.RESEND_API_KEY


def _send_via_resend(to: str, subject: str, html: str) -> bool:
    try:
        response = resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        logger.info(f"Email sent via Resend to {to} | id={response.get('id', 'n/a')}")
        return True
    except Exception as e:
        logger.warning(f"Resend failed for {to}: {e}")
        return False


def _send_via_smtp_ssl(to: str, subject: str, html: str) -> bool:
    """Gmail SMTP over SSL (port 465) — works where STARTTLS/587 is blocked."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))

        context = ssl.create_default_context()
        # Port 465 = SSL from the start (no STARTTLS handshake)
        with smtplib.SMTP_SSL(settings.SMTP_HOST, 465, context=context) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.SMTP_FROM_EMAIL, to, msg.as_string())

        logger.info(f"Email sent via SMTP SSL to {to}")
        return True
    except Exception as e:
        logger.error(f"SMTP SSL fallback failed: {e}")
        return False


def send_email(to: str, subject: str, html: str) -> bool:
    if _send_via_resend(to, subject, html):
        return True
    if _send_via_smtp_ssl(to, subject, html):
        return True
    # Last resort: log OTP so devs can still test
    otp_match = re.search(r'\b\d{6}\b', html)
    if otp_match:
        logger.warning(f"⚠️  ALL EMAIL METHODS FAILED — OTP for {to}: {otp_match.group()}")
    else:
        logger.warning(f"⚠️  ALL EMAIL METHODS FAILED — to: {to}, subject: {subject}")
    return False


# ── Templates ──────────────────────────────────────────────

def send_otp_email(to: str, otp: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#4f46e5;margin:0">MaidX</h1>
      </div>
      <h2 style="color:#1e1b4b">Your Verification Code</h2>
      <p style="color:#374151">Use the code below. It expires in <strong>10 minutes</strong>.</p>
      <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
        <span style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#4f46e5">{otp}</span>
      </div>
      <p style="color:#6b7280;font-size:12px">If you didn't request this, please ignore this email.</p>
    </div>
    """
    return send_email(to, "Your MaidX verification code", html)


def send_welcome_email(to: str, name: str, confirm_url: str = "") -> bool:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="color:#4f46e5">Welcome to MaidX, {name}! 🎉</h1>
      <p>Your account has been created successfully.</p>
      <p style="color:#6b7280;font-size:12px;margin-top:24px">
        If you didn't create this account, ignore this email.
      </p>
    </div>
    """
    return send_email(to, "Welcome to MaidX!", html)
