> **IMPORTANT**: Please read Memory.md before making any changes.
# Project Context: MaidX (Domestic Help Hiring Platform)

## Core Stack
- **Frontend**: Next.js (TypeScript) + Socket.io (Custom Server) + TailwindCSS + Framer Motion
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase
- **Auth**: Custom JWT Auth (bcrypt + HttpOnly Refresh Tokens) — transitioned from managed Supabase Auth
- **State**: React Context (AuthContext) — no Zustand
- **Performance**: `useDeviceTier` hook for adaptive, device-aware animations to ensure zero-lag on low-end devices.
- **Domains**: `https://maidx.focitech.in`, `https://maidx-9jk3.onrender.com`, `https://maid-x.vercel.app`


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
- [x] Location-based Maid Search (Haversine distance calculation in FastAPI + Leaflet JS UI - hardened against float casting bugs).
- [x] Support Ticketing System (API & UI).
- [x] Booking System & Dashboards (API & UI).
- [x] Implement actual booking creation flow from client search.
- [x] Implement Accept/Decline action handlers for Maid.
- [x] Hardened Custom JWT authentication and authorization at production level (DB-level active check, secure reset tokens, Axios refresh serialization, dynamic SMTP SSL/STARTTLS, safe redirection logic, and premium touch-safe/framer-motion navigation effects).
- [x] Solved page refresh session logout by implementing LocalStorage-based fallback for refresh token rotating sliding sessions across cross-origin deployments.
- [x] Debugged and refined Maid Dashboard and pages (fixed dynamic Tailwind color class compilation bugs, integrated real-time upcoming bookings feed, and resolved fixed layout sidebar overlaps on desktop viewports).
- [x] Debugged and refined Client/User Dashboard and pages (implemented client-side Cancel Booking action handler on active bookings list).
- [x] Refined Landing Page with non-technical friendly copy and created/linked clean Privacy, Terms, Refund, and Cancellation policy pages.
- [x] Implemented RAG-based AI assistant using Groq Llama-3.3 model for booking automation and booking history checks via floating chatbot drawer interface.
- [x] Fixed chatbot /chat endpoint backend: added User-Agent header to Groq requests to bypass Cloudflare 403 blocks and fetched email/full_name dynamically to prevent KeyError.
- [x] Hardened chatbot booking action handler against NoneType/unset hourly_rate values to prevent multiplication TypeErrors.
- [x] Added maid detail bottom-sheet drawer in client find-maids page (bio, skills, rating, rate, distance, verified badge) with Book Now CTA, and extended /maids API to return bio and city fields.
- [x] Implemented full reviews/ratings system: POST /reviews (post-completion), GET /reviews/maid/{id}, GET /reviews/check/{booking_id}, auto-recalculates maid avg rating+count. Star rating modal in bookings page. Reviews shown in maid detail drawer.
- [x] Implemented recommendation system: GET /reviews/recommended with weighted score (70% rating + 30% review volume). Top Helpers section on client home dashboard.
- [x] Fixed mobile layout map overlapping page header issues by applying relative z-10 index layout scope and isolated z-0 stacking context to LocationPicker map.



## User Roles
1. **Admin**: Manage users, monitor bookings, resolve tickets, view statistics.
2. **Maid**: Profile setup (skills, hourly rate, radius), manage bookings.
3. **Client**: Search maids (proximity), book services, manage profile, submit tickets.

> **CRITICAL RULE**: Read Memory.md before making any changes. Always read this `Memory.md` before making any project changes.
