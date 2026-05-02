from supabase import create_client, Client
from app.core.config import get_settings

_settings = get_settings()

# Admin client — bypasses RLS. Use ONLY server-side.
supabase: Client = create_client(_settings.SUPABASE_URL, _settings.SUPABASE_SERVICE_ROLE_KEY)
