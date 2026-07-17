import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.dependencies import get_current_user
from app.services.llm import call_groq_llama

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    text: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

def parse_end_time(start_time_str: str, hours: int) -> str:
    try:
        parts = start_time_str.split(":")
        h = int(parts[0])
        m = int(parts[1]) if len(parts) > 1 else 0
        total_minutes = h * 60 + m + hours * 60
        end_h = (total_minutes // 60) % 24
        end_m = total_minutes % 60
        return f"{end_h:02d}:{end_m:02d}:00"
    except Exception:
        return "12:00:00"

@router.post("")
async def chat_interaction(body: ChatRequest, user: dict = Depends(get_current_user)):
    db = get_supabase()

    # Get user email & full name
    user_email = "Unknown"
    user_full_name = "Guest"
    try:
        user_res = db.table("users").select("email").eq("id", user["id"]).execute()
        if user_res.data:
            user_email = user_res.data[0]["email"]
        profile_res = db.table("profiles").select("full_name").eq("id", user["id"]).execute()
        if profile_res.data:
            user_full_name = profile_res.data[0]["full_name"]
    except Exception as e:
        logger.error(f"Error fetching chat user details: {e}")

    # RAG Context 1: Current Date & User
    today = datetime.now()
    today_str = today.strftime("%A, %Y-%m-%d")
    current_time_str = today.strftime("%H:%M")

    # RAG Context 2: Maids list (to match names and rates)
    maids_res = db.table("profiles").select("id, full_name, hourly_rate, skills, bio").eq("role", "maid").execute()
    maids = maids_res.data or []
    maids_context = ""
    for m in maids:
        skills_str = ", ".join(m.get("skills") or [])
        rate = m.get("hourly_rate")
        rate_str = f"₹{rate}/hour" if rate is not None else "Not set"
        maids_context += f"- ID: {m['id']}, Name: {m['full_name']}, Rate: {rate_str}, Skills: [{skills_str}], Bio: {m.get('bio') or 'No bio'}\n"

    # RAG Context 3: User's bookings (filter at database level and limit payload size)
    bookings_res = db.table("bookings")\
        .select("*")\
        .or_(f"client_id.eq.{user['id']},maid_id.eq.{user['id']}")\
        .order("booking_date", desc=True)\
        .limit(30)\
        .execute()
    user_bookings = bookings_res.data or []
    
    # Map maid/client names
    profile_ids = set()
    for b in user_bookings:
        profile_ids.add(b["client_id"])
        profile_ids.add(b["maid_id"])
            
    profiles_res = db.table("profiles").select("id, full_name").in_("id", list(profile_ids)).execute()
    profile_map = {p["id"]: p["full_name"] for p in (profiles_res.data or [])}

    bookings_context = ""
    for b in user_bookings:
        client_name = profile_map.get(b["client_id"], "Unknown Client")
        maid_name = profile_map.get(b["maid_id"], "Unknown Maid")
        bookings_context += f"- Booking ID: {b['id']}, Date: {b['booking_date']}, Time: {b['start_time']}, Hours: {b['total_hours']}, Price: ₹{b['total_price']}, Status: {b['status']}, Client: {client_name}, Helper: {maid_name}\n"

    if not bookings_context:
        bookings_context = "No bookings found.\n"

    # Build Prompt
    system_instruction = (
        "You are MaidX AI — a home helper booking assistant. Be CONCISE and DIRECT. Max 3 sentences per reply.\n"
        "RULES:\n"
        "1. Never use technical words (API, database, token, endpoint). Use everyday language.\n"
        "2. Use the live data provided — maids list and user bookings — to answer accurately.\n"
        "3. When listing bookings: show them as a short bullet list with date, helper name, time, status.\n"
        "4. When listing helpers: show name, rate, skills in one line each. Do NOT write paragraphs.\n"
        "5. To BOOK: you need Helper Name, Date (YYYY-MM-DD), Start Time (HH:MM), and Hours. Ask for ONLY missing info in ONE message.\n"
        "6. When you have all 4 booking details, confirm briefly (1 sentence) then append on LAST LINE:\n"
        "   [BOOK_ACTION: {\"maid_id\": \"<id>\", \"booking_date\": \"YYYY-MM-DD\", \"start_time\": \"HH:MM\", \"hours\": <int>}]\n"
        "7. To CANCEL a booking: identify which booking the user means from the bookings list, then append on LAST LINE:\n"
        "   [CANCEL_ACTION: {\"booking_id\": \"<booking_uuid>\"}]\n"
        "   Only cancel bookings with status 'pending' or 'confirmed'. If already cancelled/completed, say so.\n"
        "8. CRITICAL: If the user says 'cancel', 'cancel karo', 'cancel kardo', 'hatao', 'band karo' — they want to CANCEL an existing booking. NEVER book a new one.\n"
        "9. Never repeat information already given. Never say 'I'd be happy to help'. Just do it.\n"
        "10. If the user writes in Hindi or Hinglish, reply in the same language — short and clear.\n"
        "11. Do NOT ask for confirmation — act immediately once intent is clear."
    )

    full_prompt = (
        f"Today: {today_str} at {current_time_str}\n"
        f"User: {user_full_name} ({user_email})\n\n"
        f"Available Helpers:\n{maids_context}\n"
        f"User's Bookings:\n{bookings_context}\n"
        f"Chat:\n"
    )

    for h in body.history[-6:]:
        prefix = "User: " if h.role == "user" else "AI: "
        full_prompt += f"{prefix}{h.text}\n"

    full_prompt += f"User: {body.message}\nAI: "

    response_text = call_groq_llama(full_prompt, system_instruction)

    booking_created = False
    booking_cancelled = False
    action_error = ""

    # ── Handle BOOK_ACTION ──────────────────────────────────────────
    if "[BOOK_ACTION:" in response_text:
        try:
            start_idx = response_text.find("[BOOK_ACTION:") + len("[BOOK_ACTION:")
            end_idx = response_text.find("]", start_idx)
            action_data = json.loads(response_text[start_idx:end_idx].strip())

            maid_id = action_data["maid_id"]
            b_date = action_data["booking_date"]
            b_time = action_data["start_time"]
            b_hours = int(action_data["hours"])

            selected_maid = next((m for m in maids if m["id"] == maid_id), None)
            if not selected_maid:
                raise ValueError("Helper not found.")

            hourly_rate = selected_maid.get("hourly_rate")
            total_price = float(hourly_rate) * b_hours if hourly_rate is not None else 0.0
            end_time = parse_end_time(b_time, b_hours)

            db.table("bookings").insert({
                "client_id": user["id"],
                "maid_id": maid_id,
                "status": "pending",
                "booking_date": b_date,
                "start_time": b_time,
                "end_time": end_time,
                "total_hours": b_hours,
                "total_price": total_price,
                "notes": "Booked via MaidX AI Assistant"
            }).execute()

            booking_created = True
            response_text = response_text[:response_text.find("[BOOK_ACTION:")].strip()
            response_text += "\n\n✨ Booking request has been created successfully!"
        except Exception as e:
            action_error = str(e)
            logger.error(f"Failed to execute AI booking: {e}")
            response_text = response_text[:response_text.find("[BOOK_ACTION:")].strip()
            response_text += f"\n\n⚠️ Booking failed: {action_error}"

    # ── Handle CANCEL_ACTION ────────────────────────────────────────
    elif "[CANCEL_ACTION:" in response_text:
        try:
            start_idx = response_text.find("[CANCEL_ACTION:") + len("[CANCEL_ACTION:")
            end_idx = response_text.find("]", start_idx)
            action_data = json.loads(response_text[start_idx:end_idx].strip())

            booking_id = action_data["booking_id"]

            # Verify booking belongs to this user and is cancellable
            booking_res = db.table("bookings").select("id, client_id, status").eq("id", booking_id).execute()
            if not booking_res.data:
                raise ValueError("Booking not found.")
            booking = booking_res.data[0]
            if booking["client_id"] != user["id"]:
                raise ValueError("Not your booking.")
            if booking["status"] in ("cancelled", "completed"):
                raise ValueError(f"Booking is already {booking['status']}.")

            db.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).execute()

            booking_cancelled = True
            response_text = response_text[:response_text.find("[CANCEL_ACTION:")].strip()
            response_text += "\n\n✅ Booking has been cancelled successfully."
        except Exception as e:
            action_error = str(e)
            logger.error(f"Failed to cancel booking via AI: {e}")
            response_text = response_text[:response_text.find("[CANCEL_ACTION:")].strip()
            response_text += f"\n\n⚠️ Could not cancel: {action_error}"

    return {
        "response": response_text,
        "booking_created": booking_created,
        "booking_cancelled": booking_cancelled,
    }
