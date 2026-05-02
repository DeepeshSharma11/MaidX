"""
OTP service: generate, store, verify 6-digit codes.
Stored in Supabase `otp_codes` table. Expires in 10 minutes.
"""
import secrets
from datetime import datetime, timedelta, timezone

from app.core.supabase_client import get_supabase

OTP_EXPIRY_MINUTES = 10


def generate_otp() -> str:
    """Generate a 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def store_otp(email: str, otp: str, purpose: str) -> None:
    """Store OTP in DB. Invalidate any previous OTPs for the same email+purpose."""
    db = get_supabase()

    # Invalidate old OTPs
    db.table("otp_codes").update({"is_used": True}).eq("email", email).eq("purpose", purpose).eq("is_used", False).execute()

    # Insert new
    db.table("otp_codes").insert({
        "email": email,
        "otp": otp,
        "purpose": purpose,
        "is_used": False,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat(),
    }).execute()


def verify_otp(email: str, otp: str, purpose: str) -> bool:
    """Verify OTP. Returns True if valid, marks it as used."""
    db = get_supabase()

    result = (
        db.table("otp_codes")
        .select("id, expires_at")
        .eq("email", email)
        .eq("otp", otp)
        .eq("purpose", purpose)
        .eq("is_used", False)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        return False

    row = result.data[0]
    expires_at = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))

    if datetime.now(timezone.utc) > expires_at:
        return False

    # Mark as used
    db.table("otp_codes").update({"is_used": True}).eq("id", row["id"]).execute()
    return True
