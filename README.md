# MaidX - Domestic Help Hiring Platform

MaidX is an online service platform that connects domestic workers (maids) with clients. It enables maids to create profiles and allows clients to hire them based on specific requirements, time slots, and physical proximity using location services.

## Architecture & Tech Stack
- **Frontend**: Next.js 14 (TypeScript), TailwindCSS, Framer Motion, Leaflet (Maps)
- **Backend API**: FastAPI (Python), PyJWT, bcrypt
- **Database**: PostgreSQL via Supabase (Using standard SQL, no managed Auth)
- **State & Performance**: React Context, `useDeviceTier` custom hook for adaptive frame-rate UI rendering on low-end hardware.
- **Production URL**: `https://maidx.focitech.in`


## Key Features
- **Custom JWT Authentication**: Role-based access control with robust security, OTP verification, and LocalStorage-based sliding session fallback to prevent cross-origin cookie-blocking logouts.
- **Proximity-Based Search**: Robust Haversine distance calculations linking PostgreSQL geolocation columns to Leaflet map UI (hardened against serialization type mismatches).
- **Mobile-First App Layout**: Responsive persistent bottom navigation with touch-safe Framer Motion spring sliding active indicators for clients, maids, and admins.
- **Booking & Ticketing**: Complete production-ready booking creation, maid accept/decline scheduling, and support ticket system.
- **RAG-Based AI Assistant**: Floating chatbot interface powered by Groq Llama-3.3-70b with robust user details lookup, custom headers, and fallback validation for unconfigured helper parameters (like hourly rates) to automate bookings and checks in plain household terminology.

## Setup Instructions

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `.\venv\Scripts\activate` on Windows
pip install -r requirements.txt
# Set .env with DB_URL, JWT_SECRET_KEY (mandatory in production), etc.
uvicorn main:app --reload
```

### Frontend (Next.js)
```bash
cd frontend
npm install
# Set .env.local with NEXT_PUBLIC_API_URL
npm run dev
```

> **Note**: Always review `Memory.md` for project context, rules, and architecture before making changes.
