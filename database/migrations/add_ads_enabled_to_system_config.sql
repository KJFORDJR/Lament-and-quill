-- Add ads_enabled column to system_config table
-- This allows admin to control Google AdSense integration

ALTER TABLE system_config 
ADD COLUMN IF NOT EXISTS ads_enabled BOOLEAN DEFAULT false;

-- Update existing records to have ads disabled by default
UPDATE system_config 
SET ads_enabled = false 
WHERE ads_enabled IS NULL;
