"""
Email service: Resend primary → console log fallback (dev/restricted env).
SMTP removed — blocked on most cloud providers (Render, Railway, etc.).
"""
import logging
import re
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


def send_email(to: str, subject: str, html: str) -> bool:
    """Send email via Resend. Falls back to console log (dev/cloud restricted env)."""
    if _send_via_resend(to, subject, html):
        return True

    # Console fallback — extract OTP if present so devs can still test
    otp_match = re.search(r'\b\d{6}\b', html)
    if otp_match:
        logger.warning(f"⚠️  EMAIL NOT SENT — OTP for {to}: {otp_match.group()}")
    else:
        logger.warning(f"⚠️  EMAIL NOT SENT to {to} (subject: {subject})")
    return False


# ── Email Templates ──────────────────────────────────────

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
      <p>Your account has been created successfully. You can now log in and start using MaidX.</p>
      <p style="color:#6b7280;font-size:12px;margin-top:24px">If you didn't create this account, please ignore this email.</p>
    </div>
    """
    return send_email(to, "Welcome to MaidX!", html)
