-- Test RLS permissions for admin operations
-- Run this to check if RLS is blocking admin operations on fragments

-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'lament_fragments_entries';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'lament_fragments_entries';

-- Temporarily disable RLS for testing (CAUTION: Only for debugging!)
-- ALTER TABLE lament_fragments_entries DISABLE ROW LEVEL SECURITY;

-- Or add a permissive policy for admins
-- CREATE POLICY "Admins can do anything with fragments" ON lament_fragments_entries
-- FOR ALL TO authenticated
-- USING (true)
-- WITH CHECK (true);
