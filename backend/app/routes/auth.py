"""
Auth routes using Supabase Auth.
- POST /auth/signup   → register + send verification email
- POST /auth/login    → sign in → return session tokens
- POST /auth/logout   → invalidate session
- POST /auth/resend-verification → resend confirmation email
- POST /auth/forgot-password     → send OTP/reset link
"""
import logging
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.supabase_client import get_supabase
from app.core.config import get_settings
from app.services.rate_limiter import check_rate_limit
from app.services.email import send_welcome_email

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Schemas ───────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "client"  # 'client' | 'maid'


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class EmailRequest(BaseModel):
    email: EmailStr


# ── Routes ────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, request: Request):
    check_rate_limit(request, "signup")

    # Supabase Auth signup — sends built-in confirmation email by default.
    # We override with our branded email via the email hook if configured,
    # or rely on Supabase's SMTP in their dashboard.
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

    # Send our branded welcome email (non-blocking best-effort)
    confirm_url = f"{settings.FRONTEND_URL}/auth/callback"
    try:
        send_welcome_email(body.email, body.full_name, confirm_url)
    except Exception:
        pass  # Supabase will still send its own email as backup

    return {
        "message": "Account created! Check your email to verify your account.",
        "user_id": response.user.id,
    }


@router.post("/login")
async def login(body: LoginRequest, request: Request):
    check_rate_limit(request, "login")

    try:
        response = get_supabase().auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
    except Exception as e:
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
    profile = get_supabase().table("profiles").select("role").eq("id", response.user.id).single().execute()

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "token_type": "bearer",
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "role": profile.data.get("role") if profile.data else "client",
        }
    }


@router.post("/logout")
async def logout(request: Request):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()
    if token:
        try:
            get_supabase().auth.sign_out()
        except Exception:
            pass
    return {"message": "Logged out successfully."}


@router.post("/resend-verification")
async def resend_verification(body: EmailRequest, request: Request):
    check_rate_limit(request, "signup")
    try:
        get_supabase().auth.resend({
            "type": "signup",
            "email": body.email,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not resend. Check the email address.")
    return {"message": "Verification email resent."}


@router.post("/forgot-password")
async def forgot_password(body: EmailRequest, request: Request):
    check_rate_limit(request, "forgot_password")
    try:
        get_supabase().auth.reset_password_email(
            body.email,
            options={"redirect_to": f"{settings.FRONTEND_URL}/auth/reset-password"},
        )
    except Exception:
        pass  # Always return 200 to avoid email enumeration
    return {"message": "If this email exists, a password reset link has been sent."}
