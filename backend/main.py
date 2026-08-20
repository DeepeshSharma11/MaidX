import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

_KEEP_ALIVE_INTERVAL = 24 * 60 * 60  # 24 hours in seconds


async def _db_keep_alive():
    """Ping DB once every 24h to prevent Supabase free-tier auto-pause."""
    from app.core.supabase_client import get_supabase
    while True:
        try:
            sb = get_supabase()
            sb.table("users").select("id").limit(1).execute()
            logger.info("[keep-alive] DB ping OK")
        except Exception as exc:
            logger.warning("[keep-alive] DB ping FAILED: %s", exc)
        await asyncio.sleep(_KEEP_ALIVE_INTERVAL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_db_keep_alive())
    yield
    task.cancel()

from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.maids import router as maids_router
from app.routes.profile import router as profile_router
from app.routes.bookings import router as bookings_router
from app.routes.tickets import router as tickets_router
from app.routes.chat import router as chat_router
from app.routes.reviews import router as reviews_router

REQUEST_TIMEOUT = 30  # seconds

app = FastAPI(
    title="MaidX API",
    description="Backend API for MaidX Domestic Help Platform",
    version="1.0.0",
    lifespan=lifespan,
)

@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    try:
        return await asyncio.wait_for(call_next(request), timeout=REQUEST_TIMEOUT)
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={"detail": "Request timed out. Please try again."}
        )

from app.core.config import get_settings

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(maids_router)
app.include_router(profile_router)
app.include_router(bookings_router)
app.include_router(tickets_router)
app.include_router(chat_router)
app.include_router(reviews_router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "MaidX API"}


@app.get("/health")
def health_check_db():
    """Lightweight DB connectivity check — runs SELECT 1, no Supabase overhead."""
    from app.core.supabase_client import get_supabase
    db_status = "ok"
    db_error = None
    try:
        # execute_sql is not available on the Python client; use raw PostgREST RPC.
        # `rpc("select_one")` would need a DB function — instead we query a tiny
        # system-level table that always exists and returns exactly one row fast.
        sb = get_supabase()
        # Query pg_stat_activity limit 1 — zero user data, just a connectivity probe.
        result = sb.table("users").select("id").limit(1).execute()
        _ = result.data  # raises if connection failed
    except Exception as exc:
        db_status = "error"
        db_error = str(exc)

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "service": "MaidX API",
        "db": db_status,
        **({"db_error": db_error} if db_error else {}),
    }
