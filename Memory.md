# Project Context: MaidX (Domestic Help Hiring Platform)

## Core Stack
- **Frontend**: Next.js (TypeScript) + Socket.io (Custom Server) + TailwindCSS + Framer Motion
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase
- **Auth**: Custom JWT Auth (bcrypt + HttpOnly Refresh Tokens) — transitioned from managed Supabase Auth
- **State**: React Context (AuthContext) — no Zustand
- **Performance**: `useDeviceTier` hook for adaptive, device-aware animations to ensure zero-lag on low-end devices.

## Overview
MaidX connects domestic workers with clients. Time-slot based booking, verified profiles, proximity-based location search (Haversine formula), and a robust admin dashboard.

## Architecture: Frontend Routing
```
src/
├── context/AuthContext.tsx        # Custom Auth state, JWT management
├── hooks/useDeviceTier.ts         # Hardware concurrency/memory based performance scaling
├── components/
│   ├── ProtectedRoute.tsx         # Role-gated wrapper
│   ├── DashboardSidebar.tsx       # Role-aware sidebar nav
│   └── MobileNav.tsx              # Bottom navigation for mobile-first UI
├── app/
│   ├── providers.tsx              # Client-side context wrapper
│   ├── layout.tsx                 # Root layout (wraps Providers)
│   ├── page.tsx                   # Landing page (Auth-aware CTAs)
│   ├── login/page.tsx             # Login (custom backend verification)
│   ├── signup/page.tsx            # Signup with auto role selection
│   └── dashboard/
│       ├── client/                # find-maids (Leaflet Map), bookings, support, profile
│       ├── maid/                  # bookings (accept/decline), profile, location
│       └── admin/                 # users, bookings, tickets, settings
```

## Current Progress
- [x] Custom FastAPI Auth with JWT, OTP, and sliding rate limiters.
- [x] Unverified user redirection (auto opens OTP screen on login attempt).
- [x] Profile Management & Settings Pages for Admin, Client, Maid.
- [x] Mobile-first UI Architecture (MobileNav + DashboardSidebar).
- [x] Adaptive Animations (Framer Motion gated by device tiering).
- [x] Location-based Maid Search (Haversine distance calculation in FastAPI + Leaflet JS UI).
- [x] Support Ticketing System (API & UI).
- [x] Booking System & Dashboards (API & UI).
- [ ] Implement actual booking creation flow from client search.
- [ ] Implement Accept/Decline action handlers for Maid.

## User Roles
1. **Admin**: Manage users, monitor bookings, resolve tickets, view statistics.
2. **Maid**: Profile setup (skills, hourly rate, radius), manage bookings.
3. **Client**: Search maids (proximity), book services, manage profile, submit tickets.

> **CRITICAL RULE**: Always read this `Memory.md` before making any project changes.
