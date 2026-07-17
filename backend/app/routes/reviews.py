"""
Reviews API — Submit review after completed booking + fetch maid reviews.
Recommendation API — Score maids by weighted rating + review_count.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, conint
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reviews", tags=["reviews"])


class CreateReviewRequest(BaseModel):
    booking_id: str
    rating: conint(ge=1, le=5)   # type: ignore[valid-type]
    comment: str | None = None


# ── Submit Review ────────────────────────────────────────────────────

@router.post("", status_code=201)
async def submit_review(body: CreateReviewRequest, user: dict = Depends(get_current_user)):
    if user["role"] != "client":
        raise HTTPException(status_code=403, detail="Only clients can leave reviews.")

    db = get_supabase()

    # Validate booking belongs to this client and is completed
    booking_res = db.table("bookings").select("id, client_id, maid_id, status").eq("id", body.booking_id).execute()
    if not booking_res.data:
        raise HTTPException(status_code=404, detail="Booking not found.")
    booking = booking_res.data[0]
    if booking["client_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your booking.")
    if booking["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed bookings.")

    # Check not already reviewed
    existing = db.table("reviews").select("id").eq("booking_id", body.booking_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="You have already reviewed this booking.")

    maid_id = booking["maid_id"]

    # Insert review
    db.table("reviews").insert({
        "booking_id": body.booking_id,
        "client_id": user["id"],
        "maid_id": maid_id,
        "rating": body.rating,
        "comment": body.comment or "",
    }).execute()

    # Recalculate maid average rating + reviews_count
    all_reviews = db.table("reviews").select("rating").eq("maid_id", maid_id).execute()
    ratings = [r["rating"] for r in (all_reviews.data or [])]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
    db.table("profiles").update({
        "rating": avg_rating,
        "reviews_count": len(ratings),
    }).eq("id", maid_id).execute()

    return {"message": "Review submitted successfully.", "new_rating": avg_rating}


# ── Get Reviews for a Maid ───────────────────────────────────────────

@router.get("/maid/{maid_id}")
async def get_maid_reviews(maid_id: str, user: dict = Depends(get_current_user)):
    db = get_supabase()

    reviews_res = db.table("reviews").select("id, rating, comment, created_at, client_id").eq("maid_id", maid_id).order("created_at", desc=True).execute()
    reviews = reviews_res.data or []

    if not reviews:
        return {"reviews": [], "avg_rating": 0.0, "total": 0}

    # Fetch client names
    client_ids = list({r["client_id"] for r in reviews})
    profiles_res = db.table("profiles").select("id, full_name").in_("id", client_ids).execute()
    name_map = {p["id"]: p["full_name"] for p in (profiles_res.data or [])}

    for r in reviews:
        r["client_name"] = name_map.get(r["client_id"], "Anonymous")

    ratings = [r["rating"] for r in reviews]
    avg = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
    return {"reviews": reviews, "avg_rating": avg, "total": len(reviews)}


# ── Check if booking already reviewed (for UI) ───────────────────────

@router.get("/check/{booking_id}")
async def check_review(booking_id: str, user: dict = Depends(get_current_user)):
    db = get_supabase()
    existing = db.table("reviews").select("id").eq("booking_id", booking_id).execute()
    return {"reviewed": bool(existing.data)}


# ── Recommended Maids ────────────────────────────────────────────────

@router.get("/recommended")
async def get_recommended_maids(
    skill: str = Query(None),
    limit: int = Query(5),
    user: dict = Depends(get_current_user)
):
    db = get_supabase()

    query = db.table("profiles").select(
        "id, full_name, rating, reviews_count, hourly_rate, skills, bio, city, is_verified, lat, lng"
    ).eq("role", "maid").order("rating", desc=True).limit(100)

    if skill:
        query = query.contains("skills", [skill])

    res = query.execute()
    maids = res.data or []

    # Weighted score: 70% avg rating (normalized /5) + 30% review volume (capped at 50)
    def score(m):
        r = float(m.get("rating") or 0)
        rc = int(m.get("reviews_count") or 0)
        return (r / 5) * 0.7 + min(rc, 50) / 50 * 0.3

    sorted_maids = sorted(maids, key=score, reverse=True)[:limit]

    result = []
    for m in sorted_maids:
        result.append({
            "id": m["id"],
            "name": m["full_name"],
            "rating": float(m.get("rating") or 0),
            "reviews": int(m.get("reviews_count") or 0),
            "hourlyRate": float(m["hourly_rate"]) if m.get("hourly_rate") is not None else None,
            "skills": m.get("skills") or [],
            "bio": m.get("bio") or "",
            "city": m.get("city") or "",
            "isVerified": m.get("is_verified", False),
            "avatar": m["full_name"][:2].upper() if m.get("full_name") else "MD",
            "score": round(score(m), 3),
        })

    return {"recommended": result}
