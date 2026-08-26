from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import get_settings
from app.core.supabase_client import get_supabase

settings = get_settings()
security = HTTPBearer(auto_error=False)

import time

_active_cache: dict[str, tuple[bool, float]] = {}  # user_id -> (is_active, timestamp)

def clear_active_cache(user_id: str | None = None):
    """Utility to clear active status cache when user is deactivated."""
    if user_id:
        _active_cache.pop(user_id, None)
    else:
        _active_cache.clear()

def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Missing or invalid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth credentials")
        
        # Verify user is active in DB (cached for 60s to prevent per-request DB roundtrips)
        now = time.time()
        if user_id in _active_cache:
            is_active, ts = _active_cache[user_id]
            if now - ts < 60:
                if not is_active:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or disabled.")
                return {"id": user_id, "role": role}

        db = get_supabase()
        user_res = db.table("users").select("is_active").eq("id", user_id).execute()
        is_active = bool(user_res.data and user_res.data[0]["is_active"])
        _active_cache[user_id] = (is_active, now)
        if not is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or disabled."
            )

        return {"id": user_id, "role": role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def require_role(allowed_roles: list[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        return user
    return role_checker

