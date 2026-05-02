from fastapi import APIRouter, Depends
from app.core.supabase_client import get_supabase
from app.core.dependencies import require_role

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats", dependencies=[Depends(require_role(["admin"]))])
async def get_admin_stats():
    db = get_supabase()
    
    # Run multiple lightweight queries. Supabase python client doesn't support count easily in 1 roundtrip,
    # so we'll do simple queries. In production, an RPC is better.
    users_res = db.table("profiles").select("id", count="exact").execute()
    maids_res = db.table("profiles").select("id", count="exact").eq("role", "maid").execute()
    bookings_res = db.table("bookings").select("id", count="exact").execute()
    tickets_res = db.table("tickets").select("id", count="exact").eq("status", "open").execute()

    return {
        "total_users": users_res.count if hasattr(users_res, 'count') else len(users_res.data),
        "active_maids": maids_res.count if hasattr(maids_res, 'count') else len(maids_res.data),
        "total_bookings": bookings_res.count if hasattr(bookings_res, 'count') else len(bookings_res.data),
        "open_tickets": tickets_res.count if hasattr(tickets_res, 'count') else len(tickets_res.data),
    }

@router.get("/users", dependencies=[Depends(require_role(["admin"]))])
async def get_admin_users():
    db = get_supabase()
    
    # We join users and profiles using postgREST embedding
    # Unfortunately standard python supabase client might struggle with complex joins without views,
    # Let's fetch them separately or use a view if needed.
    # Actually, we can fetch profiles which have role, full_name, is_verified
    # And users which have email, is_active
    
    profiles_res = db.table("profiles").select("id, role, full_name, is_verified").execute()
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
                "verified": p["is_verified"]
            })
            
    return {"users": combined}
