from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user
from app.core.security import get_password_hash, verify_password

router = APIRouter(prefix="/profile", tags=["profile"])

class LocationUpdate(BaseModel):
    lat: float
    lng: float
    address: str | None = None
    service_radius_km: int = 5

class ProfileUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    hourly_rate: float | None = None
    bio: str | None = None
    address: str | None = None
    city: str | None = None
    notifications_enabled: bool | None = None
    skills: list[str] | None = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/")
async def get_profile(user: dict = Depends(get_current_user)):
    db = get_supabase()
    res = db.table("profiles").select("*").eq("id", user["id"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    user_res = db.table("users").select("email").eq("id", user["id"]).execute()
    email = user_res.data[0]["email"] if user_res.data else ""
    
    profile = res.data[0]
    profile["email"] = email
    return profile

@router.patch("/")
async def update_profile(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    db = get_supabase()
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        return {"message": "No data to update"}
        
    res = db.table("profiles").update(update_data).eq("id", user["id"]).execute()
    return {"message": "Profile updated successfully", "profile": res.data[0] if res.data else None}

@router.post("/change-password")
async def change_password(body: PasswordChange, user: dict = Depends(get_current_user)):
    db = get_supabase()
    user_res = db.table("users").select("id, hashed_password").eq("id", user["id"]).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    stored_hash = user_res.data[0]["hashed_password"]
    if not verify_password(body.current_password, stored_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    new_hash = get_password_hash(body.new_password)
    db.table("users").update({"hashed_password": new_hash}).eq("id", user["id"]).execute()
    return {"message": "Password changed successfully"}

@router.patch("/location")
async def update_location(body: LocationUpdate, user: dict = Depends(get_current_user)):
    if user["role"] != "maid":
        raise HTTPException(status_code=403, detail="Only maids can update service area")
        
    db = get_supabase()
    
    try:
        db.table("profiles").update({
            "lat": body.lat,
            "lng": body.lng,
            "address": body.address,
            "service_radius_km": body.service_radius_km
        }).eq("id", user["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {"message": "Location updated successfully"}
