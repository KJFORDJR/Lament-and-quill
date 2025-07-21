-- Temporary fix for registration issues
-- This temporarily disables RLS on profiles to allow registration
-- You should run the full schema-safe.sql after this to re-enable proper RLS

-- Disable RLS temporarily on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable it with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies that allow registration
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow profile creation during registration" 
ON profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Grant permissions
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
