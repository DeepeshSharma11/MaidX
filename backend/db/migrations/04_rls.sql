-- Migration 04: Row Level Security
-- Run AFTER 03_triggers.sql

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Bookings
DROP POLICY IF EXISTS "Booking participants can view." ON bookings;
CREATE POLICY "Booking participants can view." ON bookings FOR SELECT USING (auth.uid() = client_id OR auth.uid() = maid_id);

DROP POLICY IF EXISTS "Client can create booking." ON bookings;
CREATE POLICY "Client can create booking." ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
