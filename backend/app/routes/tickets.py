from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tickets", tags=["tickets"])

class CreateTicketRequest(BaseModel):
    subject: str
    description: str

@router.get("/")
async def get_tickets(user: dict = Depends(get_current_user)):
    db = get_supabase()
    
    query = db.table("tickets").select("*").order("created_at", desc=True)
    if user["role"] != "admin":
        query = query.eq("user_id", user["id"])
        
    res = query.execute()
    tickets = res.data
    
    if user["role"] == "admin" and tickets:
        user_ids = [t["user_id"] for t in tickets]
        profiles_res = db.table("profiles").select("id, full_name, role").in_("id", user_ids).execute()
        profile_map = {p["id"]: p for p in profiles_res.data}
        for t in tickets:
            p = profile_map.get(t["user_id"], {})
            t["user_name"] = p.get("full_name", "Unknown User")
            t["user_role"] = p.get("role", "unknown")
            
    return {"tickets": tickets}

@router.post("/")
async def create_ticket(body: CreateTicketRequest, user: dict = Depends(get_current_user)):
    db = get_supabase()
    
    data = {
        "user_id": user["id"],
        "subject": body.subject,
        "description": body.description,
        "status": "open"
    }
    
    res = db.table("tickets").insert(data).execute()
    return {"message": "Support ticket created successfully", "ticket": res.data[0]}
