-- Simple fix: temporarily disable RLS for profiles table
-- Run this first to get your admin dashboard working

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Add email column and populate it
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing users with emails
DO $$
DECLARE
    profile_record RECORD;
    user_email TEXT;
BEGIN
    FOR profile_record IN SELECT id FROM profiles WHERE email IS NULL LOOP
        SELECT email INTO user_email FROM auth.users WHERE id = profile_record.id;
        UPDATE profiles SET email = user_email WHERE id = profile_record.id;
    END LOOP;
END $$;
