-- Fix order_items table column names
-- Run this in your Supabase SQL Editor

-- First, let's see what columns exist
-- (You can run this query separately to check current structure)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'order_items';

-- Add missing columns and rename if needed
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS merchandise_id UUID REFERENCES merchandise(id),
ADD COLUMN IF NOT EXISTS merchandise_snapshot JSONB;

-- If unit_price exists but price_at_time doesn't, we're good
-- If both exist, we might need to choose one

-- Make sure required columns allow NULL temporarily for migration
ALTER TABLE order_items ALTER COLUMN unit_price DROP NOT NULL;
ALTER TABLE order_items ALTER COLUMN total_price DROP NOT NULL;

-- Add the constraint back after we fix the data
-- ALTER TABLE order_items ALTER COLUMN unit_price SET NOT NULL;
-- ALTER TABLE order_items ALTER COLUMN total_price SET NOT NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_merchandise_id ON order_items(merchandise_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Add comments for documentation
COMMENT ON COLUMN order_items.merchandise_id IS 'Reference to the merchandise item purchased';
COMMENT ON COLUMN order_items.unit_price IS 'Price of the item at the time of purchase';
COMMENT ON COLUMN order_items.merchandise_snapshot IS 'Snapshot of merchandise details at time of purchase';
