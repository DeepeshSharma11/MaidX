# MaidX

MaidX is a platform connecting households with trusted domestic workers (maids, cooks, cleaners). Built with Next.js and FastAPI, it features location-based search, dynamic scheduling, bilingual UI support (English/Hindi), and custom JWT authentication.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion, Leaflet.js
- **Backend**: FastAPI, Python 3.10+, PostgreSQL (Supabase)
- **Auth**: Custom JWT (bcrypt, HTTP-only cookie + localStorage fallback, sliding refresh sessions)
- **AI Assistant**: Llama 3.3 (Groq) for automated booking assistance

## Features

- **Proximity Search**: Match with nearby domestic workers using SQL geolocation queries and interactive Leaflet maps.
- **Bilingual Interface**: Toggle between English and Hindi across client and maid dashboards.
- **Adaptive Performance**: UI animation scaling based on client hardware profiles for smooth rendering on low-end mobile devices.
- **High-Speed Dashboards & APIs**: Parallel database query execution (`asyncio.gather`), query payload bounds (`limit`), 60s in-memory user-active verification cache, zero-layout-shift Skeleton UI loading, and dynamic role-based routing at `/dashboard`.
- **Security & Session Management**: Asynchronous OTP verification, rate-limited auth endpoints with probabilistic cleanup, 5-strike failed OTP attempt lockouts, capped active sessions per user, and instant session revocation on password reset.
- **Automated Keep-Alive**: Background health check task (`/health`) to maintain database connections.

## Project Structure

```
MaidX/
├── backend/            # FastAPI REST backend & services
│   ├── app/
│   │   ├── core/       # Security, DB connection, config
│   │   ├── routes/     # Auth, bookings, maids, reviews, chat
│   │   └── services/   # Email, OTP, rate limiter, LLM
│   └── main.py
└── frontend/           # Next.js 14 App Router codebase
    ├── src/
    │   ├── app/        # Pages & routing
    │   ├── components/ # Reusable UI components
    │   ├── context/    # Global AuthContext
    │   └── lib/        # Axios client & API interceptors
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database (e.g. Supabase)

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Set up virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Configure environment variables in `.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET_KEY=your_jwt_secret
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=your_email
   ```
4. Run server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

