# Project Context: MaidX (Domestic Help Hiring Platform)

## Core Stack
- **Frontend**: Next.js (TypeScript) + Socket.io (Custom Server) + TailwindCSS + Framer Motion
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase

## Overview
MaidX is an online service platform connecting domestic workers (maids) with clients. It facilitates profile creation, skill and availability showcasing, and time-slot-based booking.

## Current Progress
- [x] Initialized Next.js frontend with custom Socket.io server
- [x] Initialized FastAPI backend environment
- [x] Created full Supabase PostgreSQL Schema (`backend/db/schema.sql`)
- [x] Developed animated, modern Landing Page with Tailwind & Framer Motion
- [ ] Connect FastAPI to Supabase DB
- [ ] Implement Auth flows (Login / Signup)

## User Roles
1. **Admin**: Manage users, monitor bookings, resolve complaints, view analytical reports.
2. **Maid (Service Provider)**: Create/update profile, list skills/pricing, manage availability slots, accept/reject booking requests.
3. **Client (Service Consumer)**: Search and filter maids by location/skills/availability/rating, book time slots, manage bookings, leave ratings/reviews.

> **CRITICAL RULE**: Always read this `Memory.md` before making any project changes.
