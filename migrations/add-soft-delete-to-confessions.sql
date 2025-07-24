-- Add soft delete columns to crimson_confessions table
-- Run this in your Supabase SQL editor

ALTER TABLE crimson_confessions 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create index for better performance when filtering deleted records
CREATE INDEX IF NOT EXISTS idx_crimson_confessions_is_deleted 
ON crimson_confessions(is_deleted) WHERE is_deleted = false;

-- Add similar columns to crimson_confessions_submissions if it exists
ALTER TABLE crimson_confessions_submissions 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_crimson_confessions_submissions_is_deleted 
ON crimson_confessions_submissions(is_deleted) WHERE is_deleted = false;

-- Optional: Add soft delete to lament_submissions as well
ALTER TABLE lament_submissions 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_lament_submissions_is_deleted 
ON lament_submissions(is_deleted) WHERE is_deleted = false;

-- Add comment explaining the soft delete approach
COMMENT ON COLUMN crimson_confessions.is_deleted IS 'Soft delete flag - when true, record is hidden from users but preserved for admin recovery';
COMMENT ON COLUMN crimson_confessions.deleted_at IS 'Timestamp when the record was deleted';
COMMENT ON COLUMN crimson_confessions.deleted_by IS 'ID of the admin user who deleted this record';
