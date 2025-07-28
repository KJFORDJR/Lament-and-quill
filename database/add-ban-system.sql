-- Add ban system fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_type TEXT CHECK (ban_type IN ('temporary', 'permanent', 'shadowban'));

-- Create ban history table for audit trail
CREATE TABLE IF NOT EXISTS ban_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  banned_by UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT CHECK (action IN ('banned', 'unbanned')) NOT NULL,
  ban_type TEXT,
  reason TEXT NOT NULL,
  duration_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on ban_history
ALTER TABLE ban_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for ban_history (admin only)
CREATE POLICY "Admins can view ban history" ON ban_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Admins can insert ban history" ON ban_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

-- Function to automatically unban expired temporary bans
CREATE OR REPLACE FUNCTION check_and_unban_expired_users()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_banned = FALSE,
    banned_at = NULL,
    banned_by = NULL,
    ban_reason = NULL,
    ban_expires_at = NULL,
    ban_type = NULL
  WHERE 
    is_banned = TRUE 
    AND ban_expires_at IS NOT NULL 
    AND ban_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_profiles_ban_expires ON profiles(ban_expires_at);
CREATE INDEX IF NOT EXISTS idx_ban_history_user_id ON ban_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ban_history_created_at ON ban_history(created_at);
