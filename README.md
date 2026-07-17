# MaidX

MaidX is a web-based domestic help hiring platform that connects local helpers (maids, cooks, cleaners) with households. It offers real-time booking, proximity-based search, dynamic scheduling, and an interactive bilingual interface.

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, Framer Motion, Leaflet.js maps
- **Backend**: FastAPI (Python), PostgreSQL, SQLAlchemy
- **Database / Auth**: Supabase DB with custom JWT auth (bcrypt + HTTP-only cookies)
- **AI Integrations**: Llama-3.3-70b (via Groq) for automated booking assistance

## Features

- **Proximity-Based Search**: Matches users with nearby helpers using SQL geolocation and Leaflet maps.
- **Bilingual Support**: Toggle between English and Hindi globally with persistent settings.
- **Performance Optimized**: Adaptive UI scaling via `useDeviceTier` to ensure high performance on lower-tier mobile hardware by reducing animation density and rendering overhead.
- **AI Booking Agent**: Floating chatbot drawer helper that automates bookings and reviews history in conversational terms.
- **Role-based Dashboards**: Custom workspaces for Admins, Clients, and Helpers.
- **Custom JWT Auth**: OTP verification with sliding sessions to avoid cross-origin cookie issues.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file based on the config requirements (DB URL, JWT secrets, SMTP settings).
5. Start the API server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Create `.env.local` and set `NEXT_PUBLIC_API_URL`.
4. Run the development server:
   ```bash
   npm run dev
   ```
