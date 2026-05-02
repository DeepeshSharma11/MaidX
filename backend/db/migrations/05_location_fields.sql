-- Migration: 05_location_fields
-- Add location fields to profiles table for maid proximity search

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS service_radius_km INT DEFAULT 5;
