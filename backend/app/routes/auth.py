"""
Custom Auth routes using DB tables instead of Supabase Auth.
Flow:
  Signup:  POST /signup → creates inactive user, sends OTP → POST /verify-otp → marks user active
  Login:   POST /login → verifies pass, creates session, returns JWT access token + refresh token
  Forgot:  POST /forgot-password → sends OTP → POST /verify-reset-otp → POST /reset-password
"""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Request, Response, HTTPException, status
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


# ── Signup Flow ───────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, request: Request):
    """Register user + send OTP for email verification."""
    check_rate_limit(request, "signup")

    valid_roles = {"client", "maid", "admin"}
    role = body.role if body.role in valid_roles else "client"

    db = get_supabase()
    
    # Check if email exists
    existing_user = db.table("users").select("id, is_active").eq("email", body.email).execute()
    
    if existing_user.data:
        user = existing_user.data[0]
        if user["is_active"]:
            raise HTTPException(status_code=400, detail="Email already registered.")
        else:
            # Unverified account → resend OTP and tell frontend to show OTP screen
            otp = generate_otp()
            store_otp(body.email, otp, "signup_verify")
            send_otp_email(body.email, otp)
            return {
                "message": "Account already exists but is not verified. A new OTP has been sent.",
                "requires_otp": True,
            }

    hashed_password = get_password_hash(body.password)

    try:
        # Create inactive user
        user_res = db.table("users").insert({
            "email": body.email,
            "hashed_password": hashed_password,
            "is_active": False
        }).execute()
        user_id = user_res.data[0]["id"]

        # Create profile
        db.table("profiles").insert({
            "id": user_id,
            "role": role,
            "full_name": body.full_name,
        }).execute()

    except Exception as e:
        logger.error(f"Signup DB error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create account.")

    # Generate and send OTP
    otp = generate_otp()
    store_otp(body.email, otp, "signup_verify")
    send_otp_email(body.email, otp)

    return {
        "message": "Account created! Enter the OTP sent to your email.",
        "requires_otp": True,
    }


@router.post("/verify-otp")
async def verify_signup_otp(body: VerifyOtpRequest, request: Request):
    """Verify signup OTP to activate account."""
    check_rate_limit(request, "signup")

    if not verify_otp(body.email, body.otp, "signup_verify"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    # Mark user as active
    db = get_supabase()
    db.table("users").update({"is_active": True}).eq("email", body.email).execute()

    return {"message": "Email verified successfully! You can now log in.", "verified": True}


@router.post("/resend-otp")
async def resend_otp(body: EmailRequest, request: Request):
    check_rate_limit(request, "signup")
    otp = generate_otp()
    store_otp(body.email, otp, "signup_verify")
    send_otp_email(body.email, otp)
    return {"message": "OTP resent. Check your email."}


# ── Login ─────────────────────────────────────────────────

@router.post("/login")
async def login(body: LoginRequest, request: Request, response: Response):
    check_rate_limit(request, "login")

    db = get_supabase()
    
    user_res = db.table("users").select("id, email, hashed_password, is_active").eq("email", body.email).execute()
    if not user_res.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    
    user = user_res.data[0]

    if not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
        
    if not user["is_active"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email first.")

    # Fetch profile
    profile_res = db.table("profiles").select("role, full_name").eq("id", user["id"]).execute()
    profile = profile_res.data[0] if profile_res.data else {"role": "client", "full_name": ""}

    # Create tokens
    access_token = create_access_token(data={"sub": str(user["id"]), "role": profile["role"]})
    
    # Store refresh session
    import uuid
    from datetime import timedelta
    refresh_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    db.table("sessions").insert({
        "user_id": user["id"],
        "refresh_token": refresh_token,
        "expires_at": expires_at.isoformat()
    }).execute()

    # Set httpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["id"]),
            "email": user["email"],
            "role": profile["role"],
            "full_name": profile["full_name"],
        }
    }


# ── Refresh Token ─────────────────────────────────────────

@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token found.")

    db = get_supabase()
    session_res = db.table("sessions").select("*").eq("refresh_token", refresh_token).execute()
    
    if not session_res.data:
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401, detail="Invalid refresh token.")
        
    session = session_res.data[0]
    
    # Check expiry
    expires_at = datetime.fromisoformat(session["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        db.table("sessions").delete().eq("id", session["id"]).execute()
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401, detail="Refresh token expired.")

    # Fetch user profile to recreate token
    user_res = db.table("users").select("id, email, is_active").eq("id", session["user_id"]).execute()
    if not user_res.data or not user_res.data[0]["is_active"]:
        raise HTTPException(status_code=401, detail="User inactive or deleted.")
    
    user = user_res.data[0]
        
    profile_res = db.table("profiles").select("role, full_name").eq("id", session["user_id"]).execute()
    profile = profile_res.data[0] if profile_res.data else {"role": "client", "full_name": ""}
    
    access_token = create_access_token(data={"sub": str(session["user_id"]), "role": profile["role"]})

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": str(user["id"]),
            "email": user["email"],
            "role": profile["role"],
            "full_name": profile["full_name"],
        }
    }


# ── Logout ────────────────────────────────────────────────

@router.post("/logout")
async def logout(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        db = get_supabase()
        db.table("sessions").delete().eq("refresh_token", refresh_token).execute()
        
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully."}


# ── Forgot Password Flow ─────────────────────────────────

@router.post("/forgot-password")
async def forgot_password(body: EmailRequest, request: Request):
    check_rate_limit(request, "forgot_password")

    db = get_supabase()
    user_res = db.table("users").select("id").eq("email", body.email).execute()
    if not user_res.data:
        # Don't reveal if user exists
        return {"message": "If this email exists, an OTP has been sent."}

    otp = generate_otp()
    store_otp(body.email, otp, "password_reset")
    
    try:
        send_otp_email(body.email, otp)
    except Exception:
        pass

    return {"message": "If this email exists, an OTP has been sent."}


@router.post("/verify-reset-otp")
async def verify_reset_otp(body: VerifyOtpRequest, request: Request):
    check_rate_limit(request, "forgot_password")
    if not verify_otp(body.email, body.otp, "password_reset"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    reset_token = generate_otp()
    store_otp(body.email, reset_token, "password_reset_confirmed")
    return {"message": "OTP verified. You can now set a new password.", "reset_token": reset_token}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, request: Request):
    check_rate_limit(request, "forgot_password")

    if not verify_otp(body.email, body.otp, "password_reset_confirmed"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token. Please restart the process.")

    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    hashed_password = get_password_hash(body.new_password)
    db = get_supabase()
    db.table("users").update({"hashed_password": hashed_password}).eq("email", body.email).execute()

    return {"message": "Password reset successfully! You can now log in with your new password."}
