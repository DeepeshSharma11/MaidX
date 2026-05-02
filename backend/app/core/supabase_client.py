from supabase import create_client, Client
from app.core.config import get_settings

_client: Client | None = None


def get_supabase() -> Client:
    """Lazy-init Supabase client. Crashes only when actually called, not at import."""
    global _client
    if _client is None:
        s = get_settings()
        _client = create_client(s.SUPABASE_URL, s.SUPABASE_SERVICE_ROLE_KEY)
    return _client


# Backward-compat alias — use get_supabase() in new code
supabase = property(lambda self: get_supabase())  # type: ignore
