from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.dependencies import require_role, get_current_user
from app.core.security import get_password_hash, verify_password

router = APIRouter(prefix="/admin", tags=["admin"])

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class AdminSettings(BaseModel):
    notifications_enabled: bool | None = None

@router.get("/stats", dependencies=[Depends(require_role(["admin"]))])
async def get_admin_stats():
    db = get_supabase()
    
    users_res = db.table("profiles").select("id", count="exact").execute()
    maids_res = db.table("profiles").select("id", count="exact").eq("role", "maid").execute()
    bookings_res = db.table("bookings").select("id", count="exact").execute()
    tickets_res = db.table("tickets").select("id", count="exact").eq("status", "open").execute()

    activity_res = db.table("bookings").select("id, status, created_at, client_id").order("created_at", desc=True).limit(5).execute()
    activity = []
    if activity_res.data:
        client_ids = list(set([b["client_id"] for b in activity_res.data]))
        profiles_res = db.table("profiles").select("id, full_name").in_("id", client_ids).execute()
        profile_map = {p["id"]: p["full_name"] for p in profiles_res.data}
        
        for b in activity_res.data:
            activity.append({
                "id": b["id"],
                "text": f"Booking {b['status']} by {profile_map.get(b['client_id'], 'Unknown')}",
                "created_at": b["created_at"]
            })

    return {
        "total_users": users_res.count if hasattr(users_res, 'count') else len(users_res.data),
        "active_maids": maids_res.count if hasattr(maids_res, 'count') else len(maids_res.data),
        "total_bookings": bookings_res.count if hasattr(bookings_res, 'count') else len(bookings_res.data),
        "open_tickets": tickets_res.count if hasattr(tickets_res, 'count') else len(tickets_res.data),
        "recent_activity": activity
    }

@router.get("/users", dependencies=[Depends(require_role(["admin"]))])
async def get_admin_users():
    db = get_supabase()
    profiles_res = db.table("profiles").select("id, role, full_name, is_verified, city, created_at").execute()
    users_res = db.table("users").select("id, email, is_active").execute()
    user_map = {u["id"]: u for u in users_res.data}
    
    combined = []
    for p in profiles_res.data:
        u = user_map.get(p["id"])
        if u:
            combined.append({
                "id": p["id"],
                "name": p["full_name"],
                "email": u["email"],
                "role": p["role"],
                "status": "active" if u["is_active"] else "inactive",
                "verified": p["is_verified"],
                "city": p.get("city"),
                "created_at": p.get("created_at")
            })
    return {"users": combined}

@router.patch("/users/{user_id}/status", dependencies=[Depends(require_role(["admin"]))])
async def toggle_user_status(user_id: str):
    db = get_supabase()
    user_res = db.table("users").select("id, is_active").eq("id", user_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    current = user_res.data[0]["is_active"]
    db.table("users").update({"is_active": not current}).eq("id", user_id).execute()
    return {"is_active": not current}

@router.post("/settings/change-password")
async def admin_change_password(body: PasswordChange, user: dict = Depends(require_role(["admin"]))):
    db = get_supabase()
    # require_role returns the user dict when used as Depends directly only on dependency injection
    # re-fetch user hash
    user_res = db.table("users").select("id, hashed_password").eq("id", user["id"]).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    stored_hash = user_res.data[0]["hashed_password"]
    if not verify_password(body.current_password, stored_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    new_hash = get_password_hash(body.new_password)
    db.table("users").update({"hashed_password": new_hash}).eq("id", user["id"]).execute()
    return {"message": "Password changed successfully"}

@router.patch("/settings")
async def update_admin_settings(body: AdminSettings, user: dict = Depends(require_role(["admin"]))):
    db = get_supabase()
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        return {"message": "Nothing to update"}
    db.table("profiles").update(update_data).eq("id", user["id"]).execute()
    return {"message": "Settings updated"}
