-- System Configuration Table
-- Stores global system settings and configuration

CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_title TEXT DEFAULT 'Lament and Quill',
  site_description TEXT DEFAULT 'Two cities. Two Ghosts. One reckoning.',
  maintenance_mode BOOLEAN DEFAULT false,
  registration_enabled BOOLEAN DEFAULT true,
  forum_enabled BOOLEAN DEFAULT true,
  marketplace_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  max_file_size INTEGER DEFAULT 5, -- in MB
  session_timeout INTEGER DEFAULT 30, -- in minutes
  backup_frequency TEXT DEFAULT 'daily' CHECK (backup_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  admin_email TEXT,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT,
  analytics_enabled BOOLEAN DEFAULT true,
  debug_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create policies (only admins can access system config)
CREATE POLICY "Admin users can view system config" ON system_config FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role = 'admin'
  )
);

CREATE POLICY "Admin users can update system config" ON system_config FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role = 'admin'
  )
);

CREATE POLICY "Admin users can insert system config" ON system_config FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role = 'admin'
  )
);

-- Insert default configuration
INSERT INTO system_config (site_title, site_description, admin_email) 
VALUES ('Lament and Quill', 'Two cities. Two Ghosts. One reckoning.', 'admin@lamentandquill.com')
ON CONFLICT DO NOTHING;
