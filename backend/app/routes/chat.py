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

    # RAG Context 3: User's bookings
    bookings_res = db.table("bookings").select("*").order("booking_date", desc=True).execute()
    all_bookings = bookings_res.data or []
    user_bookings = []
    
    # Map maid/client names
    profile_ids = set()
    for b in all_bookings:
        if b["client_id"] == user["id"] or b["maid_id"] == user["id"]:
            user_bookings.append(b)
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
        "5. To book: you need Helper Name, Date (YYYY-MM-DD), Start Time (HH:MM), and Hours. Ask for ONLY missing info — ask all missing fields in ONE message.\n"
        "6. When you have all 4 booking details, confirm briefly (1 sentence) then append this block on the LAST LINE:\n"
        "   [BOOK_ACTION: {\"maid_id\": \"<id>\", \"booking_date\": \"YYYY-MM-DD\", \"start_time\": \"HH:MM\", \"hours\": <int>}]\n"
        "7. Never repeat information already given. Never say 'I'd be happy to help' or 'Great choice'. Just do it.\n"
        "8. If the user writes in Hindi or Hinglish, reply in the same language — short and clear.\n"
        "9. If no helpers are available, say so in one line.\n"
        "10. Do NOT ask for confirmation after the user gives all booking details — just book immediately."
    )

    full_prompt = (
        f"Today: {today_str} at {current_time_str}\n"
        f"User: {user_full_name} ({user_email})\n\n"
        f"Available Helpers:\n{maids_context}\n"
        f"User's Bookings:\n{bookings_context}\n"
        f"Chat:\n"
    )

    for h in body.history[-6:]:  # Keep last 6 messages — enough context, less noise
        prefix = "User: " if h.role == "user" else "AI: "
        full_prompt += f"{prefix}{h.text}\n"

    full_prompt += f"User: {body.message}\nAI: "

    response_text = call_groq_llama(full_prompt, system_instruction)

    # Check for Booking Action
    booking_created = False
    action_error = ""
    if "[BOOK_ACTION:" in response_text:
        try:
            # Extract JSON block between [BOOK_ACTION: and ]
            start_idx = response_text.find("[BOOK_ACTION:") + len("[BOOK_ACTION:")
            end_idx = response_text.find("]", start_idx)
            action_json_str = response_text[start_idx:end_idx].strip()
            action_data = json.loads(action_json_str)

            maid_id = action_data["maid_id"]
            b_date = action_data["booking_date"]
            b_time = action_data["start_time"]
            b_hours = int(action_data["hours"])

            # Verify maid exists and get hourly rate
            selected_maid = next((m for m in maids if m["id"] == maid_id), None)
            if not selected_maid:
                raise ValueError("Helper not found in the list.")

            # Create booking in Supabase
            hourly_rate = selected_maid.get("hourly_rate")
            hourly_rate_val = float(hourly_rate) if hourly_rate is not None else 0.0
            total_price = hourly_rate_val * b_hours
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
            # Clean response text from action block to show users a clean response
            response_text = response_text[:response_text.find("[BOOK_ACTION:")].strip()
            response_text += "\n\n✨ Booking request has been created successfully!"
        except Exception as e:
            action_error = str(e)
            logger.error(f"Failed to execute AI booking: {e}")
            response_text = response_text[:response_text.find("[BOOK_ACTION:")].strip()
            response_text += f"\n\n⚠️ Sorry, I tried to book but ran into a scheduling detail issue: {action_error}"

    return {
        "response": response_text,
        "booking_created": booking_created
    }
