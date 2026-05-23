from fastapi import APIRouter, Depends, Query
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user
import math

router = APIRouter(prefix="/maids", tags=["maids"])

def haversine(lat1, lon1, lat2, lon2) -> float:
    """Haversine great-circle distance in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@router.get("/")
async def search_maids(
    lat: float = Query(None),
    lng: float = Query(None),
    radius: int = Query(10),        # client search radius (fallback)
    skill: str = Query(None),
    user: dict = Depends(get_current_user),
):
    db = get_supabase()

    query = db.table("profiles").select("*").eq("role", "maid")
    if skill and skill != "All":
        query = query.contains("skills", [skill])

    res = query.execute()

    with_location = []   # maids with GPS coords
    without_location = []  # maids without — shown last

    for p in res.data:
        maid_lat = p.get("lat")
        maid_lng = p.get("lng")

        if lat is not None and lng is not None and maid_lat and maid_lng:
            dist_km = haversine(lat, lng, float(maid_lat), float(maid_lng))
            # Use maid's own service radius if set, else fall back to client's search radius
            effective_radius = float(p.get("service_radius_km") or radius)
            if dist_km > effective_radius:
                continue  # Outside service area — skip
            dist_str = f"{dist_km:.1f} km"
            sort_key = dist_km
        elif maid_lat and maid_lng:
            # Maid has location but client didn't send coords — show with N/A
            dist_str = "N/A"
            sort_key = None
        else:
            dist_str = "N/A"
            sort_key = None

        entry = {
            "id": p["id"],
            "name": p["full_name"],
            "rating": float(p.get("rating", 0) or 0),
            "reviews": p.get("reviews_count", 0) or 0,
            "distance": dist_str,
            "hourlyRate": float(p["hourly_rate"]) if p.get("hourly_rate") is not None else None,
            "skills": p.get("skills") or [],
            "avatar": p["full_name"][:2].upper() if p.get("full_name") else "MD",
            "isVerified": p.get("is_verified", False),
            "bio": p.get("bio") or "",
            "city": p.get("city") or "",
            "_sort": sort_key,
        }

        if sort_key is not None:
            with_location.append(entry)
        else:
            without_location.append(entry)

    # Sort located maids nearest first
    with_location.sort(key=lambda x: x["_sort"])

    # Remove internal sort key before returning
    all_maids = with_location + without_location
    for m in all_maids:
        m.pop("_sort", None)

    return {"maids": all_maids}
