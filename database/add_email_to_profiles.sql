-- Add email column to profiles table and populate from auth.users
-- Migration: Add email tracking to profiles

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create a function to get email from auth.users
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;
    
    RETURN user_email;
END;
$$;

-- Update existing profiles with their email addresses
UPDATE profiles 
SET email = get_user_email(id)
WHERE email IS NULL;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    now(),
    now()
  );
  RETURN new;
END;
$$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a secure admin check table to avoid recursion
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Populate admin_users table with current admins
INSERT INTO admin_users (user_id)
SELECT id FROM profiles WHERE user_role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- Create a function to maintain admin_users table
CREATE OR REPLACE FUNCTION sync_admin_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_role = 'admin' AND OLD.user_role != 'admin' THEN
    INSERT INTO admin_users (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  ELSIF NEW.user_role != 'admin' AND OLD.user_role = 'admin' THEN
    DELETE FROM admin_users WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to keep admin_users in sync
DROP TRIGGER IF EXISTS sync_admin_users_trigger ON profiles;
CREATE TRIGGER sync_admin_users_trigger
  AFTER UPDATE OF user_role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_admin_users();

-- Update profiles table RLS policies without recursion
-- Drop all possible existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read for admins" ON profiles;
DROP POLICY IF EXISTS "Enable update for admins" ON profiles;
DROP POLICY IF EXISTS "Enable all for service role" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create new policies without recursion using admin_users table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) OR
    auth.role() = 'service_role'
  );

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
DROP POLICY IF EXISTS "Admin users table readable by service role" ON admin_users;
DROP POLICY IF EXISTS "Admin users table readable by admins" ON admin_users;

CREATE POLICY "Admin users table readable by service role" ON admin_users
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin users table readable by admins" ON admin_users
  FOR SELECT USING (user_id = auth.uid());
