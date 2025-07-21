-- Add service role bypass policy for system_config table
-- This allows the middleware to access system config even without user authentication

CREATE POLICY "Service role can access system config" ON system_config FOR ALL USING (true);

-- Update the existing policies to be more specific about regular user access
DROP POLICY IF EXISTS "Admin users can view system config" ON system_config;
DROP POLICY IF EXISTS "Admin users can update system config" ON system_config;
DROP POLICY IF EXISTS "Admin users can insert system config" ON system_config;

-- Recreate policies with proper service role handling
CREATE POLICY "Admin users can view system config" ON system_config FOR SELECT USING (
  auth.role() = 'service_role' OR (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  )
);

CREATE POLICY "Admin users can update system config" ON system_config FOR UPDATE USING (
  auth.role() = 'service_role' OR (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  )
);

CREATE POLICY "Admin users can insert system config" ON system_config FOR INSERT WITH CHECK (
  auth.role() = 'service_role' OR (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  )
);
