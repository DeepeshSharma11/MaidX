from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])

class CreateBookingRequest(BaseModel):
    maid_id: str
    booking_date: str
    start_time: str
    hours: int
    total_amount: float
    notes: str | None = None

@router.get("/")
async def get_bookings(user: dict = Depends(get_current_user)):
    db = get_supabase()
    query = db.table("bookings").select("*").order("created_at", desc=True)
    if user["role"] == "client":
        query = query.eq("client_id", user["id"])
    elif user["role"] == "maid":
        query = query.eq("maid_id", user["id"])
    res = query.execute()
    bookings = res.data or []

    if not bookings:
        return {"bookings": []}

    profile_ids = set()
    for b in bookings:
        profile_ids.add(b["client_id"])
        profile_ids.add(b["maid_id"])

    profiles_res = db.table("profiles").select("id, full_name").in_("id", list(profile_ids)).execute()
    profile_map = {p["id"]: p["full_name"] for p in (profiles_res.data or [])}

    for b in bookings:
        b["client_name"] = profile_map.get(b["client_id"], "Unknown Client")
        b["maid_name"]   = profile_map.get(b["maid_id"],   "Unknown Maid")

    return {"bookings": bookings}

def calculate_end_time(start_time_str: str, hours: int) -> str:
    try:
        parts = start_time_str.split(":")
        h = int(parts[0])
        m = int(parts[1]) if len(parts) > 1 else 0
        total_minutes = h * 60 + m + hours * 60
        end_h = (total_minutes // 60) % 24
        end_m = total_minutes % 60
        return f"{end_h:02d}:{end_m:02d}:00"
    except Exception:
        return "12:00:00"  # fallback safe default

@router.post("/")
async def create_booking(body: CreateBookingRequest, user: dict = Depends(get_current_user)):
    if user["role"] != "client":
        raise HTTPException(status_code=403, detail="Only clients can create bookings.")
    db = get_supabase()
    
    end_time = calculate_end_time(body.start_time, body.hours)
    
    res = db.table("bookings").insert({
        "client_id":    user["id"],
        "maid_id":      body.maid_id,
        "status":       "pending",
        "booking_date": body.booking_date,
        "start_time":   body.start_time,
        "end_time":     end_time,
        "total_hours":  body.hours,
        "total_price":  body.total_amount,
        "notes":        body.notes,
    }).execute()
    return {"message": "Booking created successfully.", "booking": res.data[0]}


@router.patch("/{booking_id}/confirm")
async def confirm_booking(booking_id: str, user: dict = Depends(get_current_user)):
    """Maid confirms a pending booking."""
    if user["role"] != "maid":
        raise HTTPException(status_code=403, detail="Only maids can confirm bookings.")
    db = get_supabase()
    res = db.table("bookings").select("id, maid_id, status").eq("id", booking_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found.")
    booking = res.data[0]
    if booking["maid_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your booking.")
    if booking["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot confirm a '{booking['status']}' booking.")
    db.table("bookings").update({"status": "confirmed"}).eq("id", booking_id).execute()
    return {"message": "Booking confirmed."}

@router.patch("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, user: dict = Depends(get_current_user)):
    """Maid or client cancels a booking."""
    db = get_supabase()
    res = db.table("bookings").select("id, maid_id, client_id, status").eq("id", booking_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found.")
    booking = res.data[0]
    is_owner = (user["role"] == "maid" and booking["maid_id"] == user["id"]) or \
               (user["role"] == "client" and booking["client_id"] == user["id"])
    if not is_owner:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if booking["status"] in ("completed", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a '{booking['status']}' booking.")
    db.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).execute()
    return {"message": "Booking cancelled."}

@router.patch("/{booking_id}/complete")
async def complete_booking(booking_id: str, user: dict = Depends(get_current_user)):
    """Maid marks a confirmed booking as completed."""
    if user["role"] != "maid":
        raise HTTPException(status_code=403, detail="Only maids can mark bookings as completed.")
    db = get_supabase()
    res = db.table("bookings").select("id, maid_id, status").eq("id", booking_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found.")
    booking = res.data[0]
    if booking["maid_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your booking.")
    if booking["status"] != "confirmed":
        raise HTTPException(status_code=400, detail=f"Cannot complete a '{booking['status']}' booking.")
    db.table("bookings").update({"status": "completed"}).eq("id", booking_id).execute()
    return {"message": "Booking marked as completed."}
