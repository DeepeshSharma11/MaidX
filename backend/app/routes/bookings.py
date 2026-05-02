from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
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
    
    # Supabase allows fetching related tables using embedding syntax if foreign keys exist
    # If not, we fetch and join manually. For now, fetch from bookings directly.
    query = db.table("bookings").select("*").order("created_at", desc=True)
    
    if user["role"] == "client":
        query = query.eq("client_id", user["id"])
    elif user["role"] == "maid":
        query = query.eq("maid_id", user["id"])
        
    res = query.execute()
    bookings = res.data
    
    # We also need the names of the associated client/maid
    if not bookings:
        return {"bookings": []}
        
    # Get all involved profiles
    profile_ids = set()
    for b in bookings:
        profile_ids.add(b["client_id"])
        profile_ids.add(b["maid_id"])
        
    profiles_res = db.table("profiles").select("id, full_name").in_("id", list(profile_ids)).execute()
    profile_map = {p["id"]: p["full_name"] for p in profiles_res.data}
    
    for b in bookings:
        b["client_name"] = profile_map.get(b["client_id"], "Unknown Client")
        b["maid_name"] = profile_map.get(b["maid_id"], "Unknown Maid")
        
    return {"bookings": bookings}

@router.post("/")
async def create_booking(body: CreateBookingRequest, user: dict = Depends(get_current_user)):
    if user["role"] != "client":
        raise HTTPException(status_code=403, detail="Only clients can create bookings")
        
    db = get_supabase()
    
    data = {
        "client_id": user["id"],
        "maid_id": body.maid_id,
        "status": "pending",
        "booking_date": body.booking_date,
        "start_time": body.start_time,
        "hours": body.hours,
        "total_amount": body.total_amount,
        "notes": body.notes
    }
    
    res = db.table("bookings").insert(data).execute()
    return {"message": "Booking created successfully", "booking": res.data[0]}
