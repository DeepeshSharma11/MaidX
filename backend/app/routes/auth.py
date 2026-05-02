"""
Auth routes using Supabase Auth + OTP verification.
Flow:
  Signup:  POST /signup → sends OTP email → POST /verify-otp → account activated
  Login:   POST /login → returns tokens
  Forgot:  POST /forgot-password → sends OTP → POST /verify-reset-otp → POST /reset-password
"""
import logging
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.supabase_client import get_supabase
from app.core.config import get_settings
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


# ── Signup Flow ───────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, request: Request):
    """Register user + send OTP for email verification."""
    check_rate_limit(request, "signup")

    try:
        response = get_supabase().auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "full_name": body.full_name,
                    "role": body.role,
                }
            }
        })
    except Exception as e:
        logger.error(f"Supabase signup error: {e}")
        raise HTTPException(status_code=500, detail="Signup failed. Please try again.")

    if response.user is None:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Generate and send OTP
    otp = generate_otp()
    store_otp(body.email, otp, "signup_verify")
    send_otp_email(body.email, otp)

    return {
        "message": "Account created! Enter the OTP sent to your email.",
        "user_id": str(response.user.id),
        "requires_otp": True,
    }


@router.post("/verify-otp")
async def verify_signup_otp(body: VerifyOtpRequest, request: Request):
    """Verify signup OTP to activate account."""
    check_rate_limit(request, "signup")

    if not verify_otp(body.email, body.otp, "signup_verify"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    return {"message": "Email verified successfully! You can now log in.", "verified": True}


@router.post("/resend-otp")
async def resend_otp(body: EmailRequest, request: Request):
    """Resend OTP for signup verification."""
    check_rate_limit(request, "signup")

    otp = generate_otp()
    store_otp(body.email, otp, "signup_verify")
    send_otp_email(body.email, otp)

    return {"message": "OTP resent. Check your email."}


# ── Login ─────────────────────────────────────────────────

@router.post("/login")
async def login(body: LoginRequest, request: Request):
    check_rate_limit(request, "login")

    try:
        response = get_supabase().auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not response.session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Fetch profile for role
    profile = get_supabase().table("profiles").select("role, full_name").eq("id", response.user.id).single().execute()

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(response.user.id),
            "email": response.user.email,
            "role": profile.data.get("role") if profile.data else "client",
            "full_name": profile.data.get("full_name") if profile.data else "",
        }
    }


# ── Logout ────────────────────────────────────────────────

@router.post("/logout")
async def logout(request: Request):
    try:
        get_supabase().auth.sign_out()
    except Exception:
        pass
    return {"message": "Logged out successfully."}


# ── Forgot Password Flow (OTP-based) ─────────────────────

@router.post("/forgot-password")
async def forgot_password(body: EmailRequest, request: Request):
    """Send OTP for password reset."""
    check_rate_limit(request, "forgot_password")

    otp = generate_otp()
    store_otp(body.email, otp, "password_reset")

    # Best-effort send — always return 200 to prevent email enumeration
    try:
        send_otp_email(body.email, otp)
    except Exception:
        pass

    return {"message": "If this email exists, an OTP has been sent."}


@router.post("/verify-reset-otp")
async def verify_reset_otp(body: VerifyOtpRequest, request: Request):
    """Verify OTP for password reset. Returns a temporary token."""
    check_rate_limit(request, "forgot_password")

    if not verify_otp(body.email, body.otp, "password_reset"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    # Generate a new OTP as a single-use reset token
    reset_token = generate_otp()
    store_otp(body.email, reset_token, "password_reset_confirmed")

    return {"message": "OTP verified. You can now set a new password.", "reset_token": reset_token}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, request: Request):
    """Reset password after OTP verification."""
    check_rate_limit(request, "forgot_password")

    # Verify the reset token
    if not verify_otp(body.email, body.otp, "password_reset_confirmed"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token. Please restart the process.")

    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    # Use Supabase admin to update password
    try:
        # Find user by email
        users = get_supabase().auth.admin.list_users()
        target_user = None
        for u in users:
            if hasattr(u, 'email') and u.email == body.email:
                target_user = u
                break

        if not target_user:
            raise HTTPException(status_code=404, detail="User not found.")

        get_supabase().auth.admin.update_user_by_id(
            str(target_user.id),
            {"password": body.new_password}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Password reset failed. Please try again.")

    return {"message": "Password reset successfully! You can now log in with your new password."}
