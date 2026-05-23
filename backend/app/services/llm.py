import json
import urllib.request
import urllib.error
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def call_groq_llama(prompt: str, system_instruction: str = None) -> str:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        logger.warning("GROQ_API_KEY is not configured.")
        return "Chatbot is currently offline because the Groq API Key is missing. Please set GROQ_API_KEY in your configuration settings."

    url = "https://api.groq.com/openai/v1/chat/completions"

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": messages,
        "temperature": 0.2
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            choices = res_data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "")
            return "Sorry, I couldn't get a response from the Llama assistant."
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        logger.error(f"Groq API HTTP Error: {e.code} - {err_msg}")
        return "An error occurred while speaking to the assistant. Please try again."
    except Exception as e:
        logger.error(f"Groq API Error: {str(e)}")
        return "Failed to connect to the Llama assistant. Please check your network connection and try again."
