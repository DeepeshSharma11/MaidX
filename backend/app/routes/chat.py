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
        "You are MaidX AI, a friendly home booking assistant.\n"
        "Your goal is to answer questions about bookings and help the user book household helpers.\n"
        "CRITICAL RULES:\n"
        "1. Do NOT use technical words (e.g. database, endpoint, RAG, API, CORS, localstorage, token). Speak in simple, friendly, everyday household terms.\n"
        "2. If you want to check bookings or helpers, use the provided list of maids and user's bookings. This is real live data.\n"
        "3. To book a helper, you need to know: Helper Name, Date (YYYY-MM-DD format), Start Time (HH:MM format), and Duration (Hours).\n"
        "4. Once you have all 4 pieces of information, match the helper name to their ID in the Maids list, then at the very end of your response append a special block:\n"
        "   `[BOOK_ACTION: {\"maid_id\": \"helper_id_here\", \"booking_date\": \"YYYY-MM-DD\", \"start_time\": \"HH:MM\", \"hours\": duration_integer}]`\n"
        "5. Explain to the user in a friendly way that you are booking this helper for them."
    )

    full_prompt = (
        f"Today's date and time: {today_str} at {current_time_str}\n\n"
        f"Logged in user: {user_email} (Name: {user_full_name}, Role: {user['role']})\n\n"
        f"Available Household Helpers (Maids):\n{maids_context}\n"
        f"User's Existing Bookings:\n{bookings_context}\n"
        f"Conversation History:\n"
    )

    for h in body.history[-10:]:  # Keep last 10 messages for context
        prefix = "User: " if h.role == "user" else "Assistant: "
        full_prompt += f"{prefix}{h.text}\n"

    full_prompt += f"User: {body.message}\nAssistant: "

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
