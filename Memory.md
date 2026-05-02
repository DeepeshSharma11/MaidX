# Project Context: MaidX (Domestic Help Hiring Platform)

## Core Stack
- **Frontend**: Next.js (TypeScript) + Socket.io (Custom Server)
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase

## Overview
MaidX is an online service platform connecting domestic workers (maids) with clients. It facilitates profile creation, skill and availability showcasing, and time-slot-based booking.

## User Roles
1. **Admin**: Manage users, monitor bookings, resolve complaints, view analytical reports.
2. **Maid (Service Provider)**: Create/update profile, list skills/pricing, manage availability slots, accept/reject booking requests.
3. **Client (Service Consumer)**: Search and filter maids by location/skills/availability/rating, book time slots, manage bookings, leave ratings/reviews.

## Key Modules
- **Authentication**: Registration (Name, Phone/Email, Password) & Secure Login.
- **Search & Booking**: Advanced search, availability calendar, prevent double booking.
- **Help Desk**: Ticket raising, tracking, and admin resolution.
- **Real-time Notifications**: Booking confirmations, cancellations, and updates.
- **Future Enhancements**: AI recommendations, real-time tracking, online payments.

> **CRITICAL RULE**: Always read this `Memory.md` before making any project changes.
