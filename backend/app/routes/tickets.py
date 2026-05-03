from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tickets", tags=["tickets"])

class CreateTicketRequest(BaseModel):
    subject: str
    description: str

class UpdateTicketRequest(BaseModel):
    status: str  # "open" | "in_progress" | "resolved" | "closed"

@router.get("/")
async def get_tickets(user: dict = Depends(get_current_user)):
    db = get_supabase()
    query = db.table("tickets").select("*").order("created_at", desc=True)
    if user["role"] != "admin":
        query = query.eq("user_id", user["id"])
    res = query.execute()
    tickets = res.data or []

    if user["role"] == "admin" and tickets:
        user_ids = list({t["user_id"] for t in tickets})
        profiles_res = db.table("profiles").select("id, full_name, role").in_("id", user_ids).execute()
        profile_map = {p["id"]: p for p in (profiles_res.data or [])}
        for t in tickets:
            p = profile_map.get(t["user_id"], {})
            t["user_name"] = p.get("full_name", "Unknown User")
            t["user_role"] = p.get("role", "unknown")

    return {"tickets": tickets}

@router.post("/")
async def create_ticket(body: CreateTicketRequest, user: dict = Depends(get_current_user)):
    db = get_supabase()
    res = db.table("tickets").insert({
        "user_id": user["id"],
        "subject": body.subject,
        "description": body.description,
        "status": "open"
    }).execute()
    return {"message": "Ticket submitted successfully.", "ticket": res.data[0]}

@router.patch("/{ticket_id}")
async def update_ticket_status(
    ticket_id: str,
    body: UpdateTicketRequest,
    user: dict = Depends(get_current_user)
):
    """Admin only — update ticket status."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

    allowed = {"open", "in_progress", "resolved", "closed"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {allowed}")

    db = get_supabase()
    ticket_res = db.table("tickets").select("id").eq("id", ticket_id).execute()
    if not ticket_res.data:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    db.table("tickets").update({"status": body.status}).eq("id", ticket_id).execute()
    return {"message": f"Ticket status updated to '{body.status}'."}
