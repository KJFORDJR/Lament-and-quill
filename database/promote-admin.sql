-- Promote a user to admin role
-- Method 1: By username (if you know the username)
UPDATE profiles 
SET user_role = 'admin', 
    updated_at = NOW()
WHERE username = 'your-username-here';

-- Method 2: By user ID (if you know the Supabase auth user ID)
-- UPDATE profiles 
-- SET user_role = 'admin', 
--     updated_at = NOW()
-- WHERE id = 'user-uuid-here';

-- Method 3: Join with auth.users to find by email
-- This requires service role access in Supabase SQL editor
UPDATE profiles 
SET user_role = 'admin', 
    updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'kingkesterick@gmail.com'
);

-- Verify the change
SELECT p.id, p.username, au.email, p.user_role, p.created_at, p.updated_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'kingkesterick@gmail.com';

-- Optional: List all admin users with their emails
-- SELECT p.id, p.username, au.email, p.user_role, p.created_at
-- FROM profiles p
-- JOIN auth.users au ON p.id = au.id
-- WHERE p.user_role = 'admin'
-- ORDER BY p.created_at DESC;
