-- Add 'banned' role to user_role enum
-- Run this to allow banning users

-- Update the user_role constraint to include 'banned'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_role_check 
CHECK (user_role IN ('user', 'admin', 'moderator', 'banned'));
