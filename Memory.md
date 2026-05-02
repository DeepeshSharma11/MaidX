# Project Context: MaidX (Domestic Help Hiring Platform)

## Core Stack
- **Frontend**: Next.js (TypeScript) + Socket.io (Custom Server) + TailwindCSS + Framer Motion
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth (managed) — profiles table extends auth.users
- **State**: React Context (AuthContext) — no Zustand

## Overview
MaidX connects domestic workers with clients. Time-slot based booking, verified profiles, ratings.

## Architecture: Frontend Routing
```
src/
├── context/AuthContext.tsx        # Auth state, login/signup/logout
├── components/
│   ├── ProtectedRoute.tsx         # Role-gated wrapper
│   └── DashboardSidebar.tsx       # Role-aware sidebar nav
├── app/
│   ├── providers.tsx              # Client-side context wrapper
│   ├── layout.tsx                 # Root layout (wraps Providers)
│   ├── page.tsx                   # Landing page
│   ├── login/page.tsx             # Login (uses AuthContext)
│   ├── signup/page.tsx            # Signup with role picker
│   ├── forgot-password/page.tsx
│   └── dashboard/
│       ├── client/
│       │   ├── layout.tsx         # ProtectedRoute(client)
│       │   └── page.tsx           # Client dashboard
│       ├── maid/
│       │   ├── layout.tsx         # ProtectedRoute(maid)
│       │   └── page.tsx           # Maid dashboard
│       └── admin/
│           ├── layout.tsx         # ProtectedRoute(admin)
│           └── page.tsx           # Admin dashboard
├── lib/api.ts                     # Axios client
└── store/authStore.ts             # (deprecated — use AuthContext)
```

## Current Progress
- [x] Next.js frontend with custom Socket.io server
- [x] FastAPI backend (`app/core`, `app/routes`, `app/services`)
- [x] Supabase Schema: RLS, auto-profile trigger, review rating trigger
- [x] Landing page (animated, Tailwind + Framer Motion)
- [x] Auth backend: signup/login/logout/resend/forgot-password with OTP
- [x] Email: Resend → SMTP fallback
- [x] Rate Limiting: Per-IP + Per-device (sliding 15-min window)
- [x] AuthContext (React Context) + ProtectedRoute
- [x] DashboardSidebar (role-aware nav)
- [x] 3 role-based route groups: /dashboard/client, /dashboard/maid, /dashboard/admin
- [x] Login/Signup/ForgotPassword pages (using AuthContext)
- [x] OTP Verification for Signup and Forgot Password flows
- [ ] Maid search & booking flow
- [ ] Profile management

## User Roles
1. **Admin**: Manage users, monitor bookings, resolve complaints, view reports.
2. **Maid**: Profile, skills/pricing, availability slots, accept/reject bookings.
3. **Client**: Search maids, book time slots, manage bookings, leave reviews.

> **CRITICAL RULE**: Always read this `Memory.md` before making any project changes.
