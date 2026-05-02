# MaidX - Domestic Help Hiring Platform

MaidX is an online service platform that connects domestic workers (maids) with clients. It enables maids to create profiles and allows clients to hire them based on specific requirements, time slots, and physical proximity using location services.

## Architecture & Tech Stack
- **Frontend**: Next.js 14 (TypeScript), TailwindCSS, Framer Motion, Leaflet (Maps)
- **Backend API**: FastAPI (Python), PyJWT, bcrypt
- **Database**: PostgreSQL via Supabase (Using standard SQL, no managed Auth)
- **State & Performance**: React Context, `useDeviceTier` custom hook for adaptive frame-rate UI rendering on low-end hardware.

## Key Features
- **Custom JWT Authentication**: Role-based access control with robust security and OTP verification.
- **Proximity-Based Search**: Haversine distance calculations linking PostgreSQL geolocation columns to Leaflet map UI.
- **Mobile-First App Layout**: Responsive persistent bottom navigation for clients, maids, and admins.
- **Booking & Ticketing**: Complete End-to-End scheduling and support ticket system.

## Setup Instructions

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `.\venv\Scripts\activate` on Windows
pip install -r requirements.txt
# Set .env with DB_URL, JWT_SECRET, etc.
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
