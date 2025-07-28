-- Complete fix for RLS recursion - use a separate admin check
-- This creates a separate function to check admin status without recursion

-- First, disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Add email column if needed
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Populate emails for existing users
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

-- Update the user creation trigger
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

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a function to check if current user is admin (without recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY definer
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND user_role = 'admin'
  );
$$;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can access all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Enable read for own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read for admins" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Enable update for admins" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Enable all for service role" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
