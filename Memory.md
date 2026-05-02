# Project Context: MaidX (Domestic Help Hiring Platform)

## Core Stack
- **Frontend**: Next.js (TypeScript) + Socket.io (Custom Server) + TailwindCSS + Framer Motion
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase

## Overview
MaidX is an online service platform connecting domestic workers (maids) with clients. It facilitates profile creation, skill and availability showcasing, and time-slot-based booking.

## Current Progress
- [x] Initialized Next.js frontend with custom Socket.io server
- [x] Initialized FastAPI backend with app structure (`app/core`, `app/routes`, `app/services`)
- [x] Supabase PostgreSQL Schema with RLS, auto-profile trigger, review rating trigger
- [x] Animated Landing Page (Tailwind, Framer Motion, Lucide icons)
- [x] Auth backend: Supabase Auth signup/login/logout/resend/forgot-password
- [x] Email: Resend primary → Google SMTP fallback with HTML branded templates
- [x] Rate Limiting: Per-IP + Per-device fingerprint (sliding 15-min window in Supabase table)
- [x] Frontend: Login page, Signup page (with role picker), Forgot Password page
- [x] Zustand auth store (persisted) + Axios client with Bearer token interceptor
- [ ] Auth callback handler (Supabase email confirmation redirect)
- [ ] Role-based dashboards (Client / Maid / Admin)
- [ ] Maid search & booking flow

## User Roles
1. **Admin**: Manage users, monitor bookings, resolve complaints, view analytical reports.
2. **Maid (Service Provider)**: Create/update profile, list skills/pricing, manage availability slots, accept/reject booking requests.
3. **Client (Service Consumer)**: Search and filter maids by location/skills/availability/rating, book time slots, manage bookings, leave ratings/reviews.

> **CRITICAL RULE**: Always read this `Memory.md` before making any project changes.
