from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

class LocationUpdate(BaseModel):
    lat: float
    lng: float
    address: str | None = None
    service_radius_km: int = 5

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
