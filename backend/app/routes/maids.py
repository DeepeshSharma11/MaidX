from fastapi import APIRouter, Depends, Query
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user
import math

router = APIRouter(prefix="/maids", tags=["maids"])

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@router.get("/")
async def search_maids(
    lat: float = Query(None),
    lng: float = Query(None),
    radius: int = Query(5),
    skill: str = Query(None),
    user: dict = Depends(get_current_user)
):
    db = get_supabase()
    
    # Base query for maids
    query = db.table("profiles").select("*").eq("role", "maid")
    if skill and skill != "All":
        query = query.contains("skills", [skill])
        
    res = query.execute()
    maids = []
    
    for p in res.data:
        # Distance calculation
        dist = None
        if lat is not None and lng is not None and p.get("lat") and p.get("lng"):
            dist = haversine(lat, lng, p["lat"], p["lng"])
            if dist > (p.get("service_radius_km") or radius):
                continue # Outside service area
        
        maids.append({
            "id": p["id"],
            "name": p["full_name"],
            "rating": float(p.get("rating", 0) or 0),
            "reviews": p.get("reviews_count", 0) or 0,
            "distance": f"{dist:.1f} km" if dist is not None else "N/A",
            "hourlyRate": float(p.get("hourly_rate", 0) or 0),
            "skills": p.get("skills") or [],
            "avatar": p["full_name"][:2].upper() if p.get("full_name") else "MD",
            "isVerified": p.get("is_verified", False)
        })
        
    return {"maids": maids}
