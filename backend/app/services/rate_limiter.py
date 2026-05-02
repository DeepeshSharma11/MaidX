"""
Rate limiter: checks per-IP and per-device fingerprint.
Stored in Supabase `rate_limits` table (no Redis dependency).
Window: sliding 15-minute window.
"""
from datetime import datetime, timedelta, timezone
from fastapi import Request, HTTPException, status

from app.core.supabase_client import get_supabase

# Config: max attempts per window per action
LIMITS = {
    "signup": 5,
    "login": 10,
    "forgot_password": 3,
}
WINDOW_MINUTES = 15


def _get_identifiers(request: Request) -> list[str]:
    """Return IP + optional device fingerprint from headers."""
    forwarded = request.headers.get("x-forwarded-for")
    ip = forwarded.split(",")[0].strip() if forwarded else request.client.host
    device_fp = request.headers.get("x-device-fingerprint", "")
    identifiers = [f"ip:{ip}"]
    if device_fp:
        identifiers.append(f"device:{device_fp}")
    return identifiers


def check_rate_limit(request: Request, action: str) -> None:
    """
    Raise HTTP 429 if any identifier exceeds the limit for the action.
    """
    max_attempts = LIMITS.get(action, 5)
    window_start = datetime.now(timezone.utc) - timedelta(minutes=WINDOW_MINUTES)

    for identifier in _get_identifiers(request):
        result = (
            get_supabase().table("rate_limits")
            .select("id, attempt_count, window_start")
            .eq("identifier", identifier)
            .eq("action", action)
            .gte("window_start", window_start.isoformat())
            .execute()
        )

        if result.data:
            row = result.data[0]
            count = row["attempt_count"]

            if count >= max_attempts:
                retry_after = WINDOW_MINUTES * 60
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many {action} attempts. Try again in {WINDOW_MINUTES} minutes.",
                    headers={"Retry-After": str(retry_after)},
                )

            # Increment count
            get_supabase().table("rate_limits").update(
                {"attempt_count": count + 1}
            ).eq("id", row["id"]).execute()

        else:
            # First attempt in window
            get_supabase().table("rate_limits").insert({
                "identifier": identifier,
                "action": action,
                "attempt_count": 1,
                "window_start": datetime.now(timezone.utc).isoformat(),
            }).execute()
