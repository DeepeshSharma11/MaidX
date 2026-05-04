"""
Custom Auth — production-ready.
  Signup:  POST /signup → inactive user + OTP email → POST /verify-otp → active
  Login:   POST /login → JWT access token (cookie) + refresh token (httpOnly cookie)
  Forgot:  POST /forgot-password → OTP email → POST /verify-reset-otp → POST /reset-password
"""
import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

from app.core.supabase_client import get_supabase
from app.core.config import get_settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.rate_limiter import check_rate_limit
from app.services.email import send_otp_email
from app.services.otp import generate_otp, store_otp, verify_otp

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Schemas ───────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "client"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class EmailRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


# ── Helpers ──────────────────────────────────────────────

def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
    )

def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie("refresh_token", secure=True, samesite="none")

def _issue_session(db, user_id: str, role: str, full_name: str, email: str, response: Response) -> dict:
    """Create DB session + set cookie + return token payload."""
    access_token = create_access_token(data={"sub": str(user_id), "role": role})
    refresh_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    db.table("sessions").insert({
        "user_id": user_id,
        "refresh_token": refresh_token,
        "expires_at": expires_at.isoformat(),
    }).execute()

    _set_refresh_cookie(response, refresh_token)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": str(user_id), "email": email, "role": role, "full_name": full_name},
    }


# ── Signup ────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, request: Request):
    check_rate_limit(request, "signup")

    valid_roles = {"client", "maid"}          # admin cannot self-register
    role = body.role if body.role in valid_roles else "client"

    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    db = get_supabase()
    existing = db.table("users").select("id, is_active").eq("email", body.email).execute()

    if existing.data:
        if existing.data[0]["is_active"]:
            raise HTTPException(status_code=400, detail="Email already registered.")
        # Unverified — resend OTP silently
        otp = generate_otp()
        store_otp(body.email, otp, "signup_verify")
        send_otp_email(body.email, otp)
        return {"message": "Verification email resent. Check your inbox.", "requires_otp": True}

    try:
        user_res = db.table("users").insert({
            "email": body.email,
            "hashed_password": get_password_hash(body.password),
            "is_active": False,
        }).execute()
        user_id = user_res.data[0]["id"]
        db.table("profiles").insert({
            "id": user_id, "role": role, "full_name": body.full_name,
        }).execute()
    except Exception as e:
        logger.error(f"Signup DB error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create account.")

    otp = generate_otp()
    store_otp(body.email, otp, "signup_verify")
    send_otp_email(body.email, otp)

    return {"message": "Account created! Check your email for the verification code.", "requires_otp": True}


@router.post("/verify-otp")
async def verify_signup_otp(body: VerifyOtpRequest, request: Request):
    check_rate_limit(request, "otp_verify")
    if not verify_otp(body.email, body.otp, "signup_verify"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
    db = get_supabase()
    db.table("users").update({"is_active": True}).eq("email", body.email).execute()
    return {"message": "Email verified! You can now log in.", "verified": True}


@router.post("/resend-otp")
async def resend_otp(body: EmailRequest, request: Request):
    check_rate_limit(request, "otp_verify")
    otp = generate_otp()
    store_otp(body.email, otp, "signup_verify")
    send_otp_email(body.email, otp)
    return {"message": "Verification code resent. Check your email."}


# ── Login ─────────────────────────────────────────────────

@router.post("/login")
async def login(body: LoginRequest, request: Request, response: Response):
    check_rate_limit(request, "login")

    db = get_supabase()
    user_res = db.table("users").select("id, email, hashed_password, is_active").eq("email", body.email).execute()

    # Unified error — don't reveal whether email exists
    if not user_res.data or not verify_password(body.password, user_res.data[0]["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user = user_res.data[0]

    if not user["is_active"]:
        otp = generate_otp()
        store_otp(body.email, otp, "signup_verify")
        send_otp_email(body.email, otp)
        return JSONResponse(status_code=200, content={
            "requires_otp": True,
            "email": body.email,
            "message": "Email not verified. A new code has been sent.",
        })

    profile_res = db.table("profiles").select("role, full_name").eq("id", user["id"]).execute()
    profile = profile_res.data[0] if profile_res.data else {"role": "client", "full_name": ""}

    return _issue_session(db, user["id"], profile["role"], profile["full_name"], user["email"], response)


# ── Refresh Token ─────────────────────────────────────────

@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token.")

    db = get_supabase()
    session_res = db.table("sessions").select("*").eq("refresh_token", token).execute()
    if not session_res.data:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Invalid session.")

    session = session_res.data[0]
    expires_at = datetime.fromisoformat(session["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        db.table("sessions").delete().eq("id", session["id"]).execute()
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    user_res = db.table("users").select("id, email, is_active").eq("id", session["user_id"]).execute()
    if not user_res.data or not user_res.data[0]["is_active"]:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Account inactive.")

    user = user_res.data[0]
    profile_res = db.table("profiles").select("role, full_name").eq("id", user["id"]).execute()
    profile = profile_res.data[0] if profile_res.data else {"role": "client", "full_name": ""}

    # Rotate refresh token (sliding window)
    new_refresh = str(uuid.uuid4())
    new_expires = datetime.now(timezone.utc) + timedelta(days=7)
    db.table("sessions").update({
        "refresh_token": new_refresh,
        "expires_at": new_expires.isoformat(),
    }).eq("id", session["id"]).execute()
    _set_refresh_cookie(response, new_refresh)

    access_token = create_access_token(data={"sub": str(user["id"]), "role": profile["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": str(user["id"]), "email": user["email"], "role": profile["role"], "full_name": profile["full_name"]},
    }


# ── Logout ────────────────────────────────────────────────

@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if token:
        db = get_supabase()
        db.table("sessions").delete().eq("refresh_token", token).execute()
    _clear_refresh_cookie(response)
    return {"message": "Logged out successfully."}


# ── Forgot Password ───────────────────────────────────────

@router.post("/forgot-password")
async def forgot_password(body: EmailRequest, request: Request):
    check_rate_limit(request, "forgot_password")
    db = get_supabase()
    user_res = db.table("users").select("id").eq("email", body.email).execute()

    # Always return same message — don't reveal if email exists
    if user_res.data:
        otp = generate_otp()
        store_otp(body.email, otp, "password_reset")
        send_otp_email(body.email, otp)

    return {"message": "If this email exists, a reset code has been sent."}


@router.post("/verify-reset-otp")
async def verify_reset_otp(body: VerifyOtpRequest, request: Request):
    check_rate_limit(request, "forgot_password")
    if not verify_otp(body.email, body.otp, "password_reset"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
    # Issue a short-lived reset token stored as next OTP
    reset_token = generate_otp()
    store_otp(body.email, reset_token, "password_reset_confirmed")
    return {"message": "Code verified. You can now set a new password.", "reset_token": reset_token}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, request: Request):
    check_rate_limit(request, "forgot_password")
    if not verify_otp(body.email, body.otp, "password_reset_confirmed"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    db = get_supabase()
    db.table("users").update({"hashed_password": get_password_hash(body.new_password)}).eq("email", body.email).execute()
    return {"message": "Password reset successfully. You can now log in."}
