-- Fix order_items table structure
-- Run this in your Supabase SQL Editor

-- Add missing columns to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS merchandise_id UUID REFERENCES merchandise(id),
ADD COLUMN IF NOT EXISTS price_at_time DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS merchandise_snapshot JSONB;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_merchandise_id ON order_items(merchandise_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Add comments for documentation
COMMENT ON COLUMN order_items.merchandise_id IS 'Reference to the merchandise item purchased';
COMMENT ON COLUMN order_items.price_at_time IS 'Price of the item at the time of purchase';
COMMENT ON COLUMN order_items.merchandise_snapshot IS 'Snapshot of merchandise details at time of purchase';

-- Check if we need to add foreign key constraint (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_merchandise_id_fkey' 
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_merchandise_id_fkey 
        FOREIGN KEY (merchandise_id) REFERENCES merchandise(id);
    END IF;
END $$;
