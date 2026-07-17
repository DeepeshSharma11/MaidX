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

@router.get("/public")
async def get_public_maids(
    lat: float = Query(None),
    lng: float = Query(None),
    limit: int = Query(6)
):
    db = get_supabase()
    res = db.table("profiles").select(
        "id, full_name, rating, reviews_count, hourly_rate, skills, bio, city, is_verified, lat, lng"
    ).eq("role", "maid").execute()
    
    maids = res.data or []
    scored_maids = []
    
    for m in maids:
        dist_km = None
        maid_lat = m.get("lat")
        maid_lng = m.get("lng")
        
        if lat is not None and lng is not None and maid_lat is not None and maid_lng is not None:
            dist_km = haversine(lat, lng, float(maid_lat), float(maid_lng))
            
        r = float(m.get("rating") or 0.0)
        rc = int(m.get("reviews_count") or 0)
        popularity_score = (r / 5.0) * 0.7 + min(rc, 50) / 50.0 * 0.3
        
        scored_maids.append({
            "id": m["id"],
            "name": m["full_name"],
            "rating": r,
            "reviews": rc,
            "hourlyRate": float(m["hourly_rate"]) if m.get("hourly_rate") is not None else None,
            "skills": m.get("skills") or [],
            "bio": m.get("bio") or "",
            "city": m.get("city") or "",
            "isVerified": m.get("is_verified", False),
            "avatar": m["full_name"][:2].upper() if m.get("full_name") else "MD",
            "distance_km": dist_km,
            "popularity": popularity_score
        })
        
    if lat is not None and lng is not None:
        def sort_key(x):
            d = x["distance_km"]
            if d is None:
                return (1e9, -x["popularity"])
            return (d, -x["popularity"])
        sorted_maids = sorted(scored_maids, key=sort_key)
    else:
        sorted_maids = sorted(scored_maids, key=lambda x: x["popularity"], reverse=True)
        
    return {"maids": sorted_maids[:limit]}

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

    if lat is not None and lng is not None:
        # Bounding box filter (1 degree latitude ~ 111km, 1 degree longitude ~ 111 * cos(lat) km)
        # Using maximum of client search radius and 50km to catch potential candidates
        max_r = max(float(radius), 50.0)
        lat_delta = max_r / 111.0
        cos_lat = math.cos(math.radians(lat))
        lng_delta = max_r / (111.0 * cos_lat) if cos_lat > 0. else max_r / 111.0
        
        query = query.gte("lat", lat - lat_delta)\
                     .lte("lat", lat + lat_delta)\
                     .gte("lng", lng - lng_delta)\
                     .lte("lng", lng + lng_delta)

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
