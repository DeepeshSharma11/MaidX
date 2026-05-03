import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.maids import router as maids_router
from app.routes.profile import router as profile_router
from app.routes.bookings import router as bookings_router
from app.routes.tickets import router as tickets_router

REQUEST_TIMEOUT = 30  # seconds

app = FastAPI(
    title="MaidX API",
    description="Backend API for MaidX Domestic Help Platform",
    version="1.0.0"
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


@app.get("/")
def health_check():
    return {"status": "ok", "service": "MaidX API"}
