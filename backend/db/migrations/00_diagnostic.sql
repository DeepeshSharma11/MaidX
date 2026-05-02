-- DIAGNOSTIC: Run this in Supabase SQL Editor to check what's missing

-- 1. Check if user_role enum exists
SELECT typname FROM pg_type WHERE typname IN ('user_role', 'booking_status');

-- 2. Check if profiles table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 3. Check if trigger exists
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Check if handle_new_user function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
